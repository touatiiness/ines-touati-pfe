import json
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv
import os
import numpy as np

class LessonGCN(torch.nn.Module):
    """Graph Convolutional Network pour la recommandation de cours"""
    
    def __init__(self, in_dim=5, hidden_dim=16, out_dim=1):
        super().__init__()
        self.conv1 = GCNConv(in_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, out_dim)
        self.dropout = torch.nn.Dropout(0.3)

    def forward(self, data):
        x = self.conv1(data.x, data.edge_index)
        x = F.relu(x)
        x = self.dropout(x)
        x = self.conv2(x, data.edge_index)
        return x.view(-1)


class GCNRecommender:
    """Service de recommandation utilisant un GCN"""
    
    def __init__(self, data_dir="."):
        self.data_dir = data_dir
        self.model = None
        self.lesson_labels = None
        self.label_to_idx = None
        self.enriched_data = None
        self.forward_paths = None
        self.graph_data = None
        
        # Charger les données
        self._load_data()
        if self.enriched_data and self.graph_data:
            self._prepare_graph_data()
        else:
            print("⚠️ Génération des données enrichies nécessaire")
            self._generate_enriched_data()
    
    def _load_data(self):
        """Charge tous les fichiers JSON nécessaires"""
        files_to_load = {
            'enriched_data': 'enriched_graph.json',
            'graph_data': 'graph_data.json', 
            'forward_paths': 'forward_recommendation_paths.json'
        }
        
        for attr_name, filename in files_to_load.items():
            filepath = os.path.join(self.data_dir, filename)
            try:
                with open(filepath, encoding="utf-8") as f:
                    setattr(self, attr_name, json.load(f))
                print(f"✅ {filename} chargé")
            except FileNotFoundError:
                print(f"⚠️  Fichier manquant: {filepath}")
                setattr(self, attr_name, {})
            except json.JSONDecodeError:
                print(f"⚠️  Erreur JSON dans: {filepath}")
                setattr(self, attr_name, {})

    def _generate_enriched_data(self):
        """Génère les données enrichies si elles n'existent pas"""
        try:
            from enriched_json_gen import generate_enriched_data
            print("🔄 Génération des données enrichies...")
            generate_enriched_data(self.data_dir)
            self._load_data()
            if self.enriched_data and self.graph_data:
                self._prepare_graph_data()
        except ImportError:
            print("❌ Impossible de générer les données enrichies")
    
    def _prepare_graph_data(self):
        """Prépare les données pour le modèle GCN"""
        if not self.enriched_data:
            raise ValueError("Les données enrichies ne sont pas disponibles")
            
        # Mapping des labels
        self.lesson_labels = list(self.enriched_data.keys())
        self.label_to_idx = {label: idx for idx, label in enumerate(self.lesson_labels)}
        
        # Construction de l'index des arêtes
        edges = self.graph_data.get("links", [])
        edge_list = []
        
        for link in edges:
            try:
                s, t = int(link["source"]), int(link["target"])
                # Vérifier que les indices sont valides
                if 0 <= s < len(self.lesson_labels) and 0 <= t < len(self.lesson_labels):
                    edge_list.append([s, t])
                    edge_list.append([t, s])  # graphe non-dirigé
            except (ValueError, KeyError) as e:
                print(f"⚠️ Lien ignoré: {link} - {e}")
        
        if edge_list:
            self.edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
        else:
            print("⚠️ Aucun lien valide trouvé, utilisation d'un graphe vide")
            self.edge_index = torch.empty((2, 0), dtype=torch.long)
    
    def _build_node_features(self, student_sous_acquis):
        """Construit les features des nœuds pour un étudiant donné"""
        # Normalisation robuste
        in_degrees = [feats.get("in_degree", 0) for feats in self.enriched_data.values()]
        out_degrees = [feats.get("out_degree", 0) for feats in self.enriched_data.values()]
        struggling_counts = [feats.get("struggling_students", 0) for feats in self.enriched_data.values()]
        
        max_in = max(in_degrees) if in_degrees and max(in_degrees) > 0 else 1
        max_out = max(out_degrees) if out_degrees and max(out_degrees) > 0 else 1
        max_struggle = max(struggling_counts) if struggling_counts and max(struggling_counts) > 0 else 1
        
        node_features = []
        for lesson in self.lesson_labels:
            feats = self.enriched_data[lesson]
            
            # Features normalisées avec gestion des valeurs manquantes
            bloom_norm = feats.get("bloom_norm", 0.0)
            in_deg_norm = feats.get("in_degree", 0) / max_in
            out_deg_norm = feats.get("out_degree", 0) / max_out
            struggle_norm = feats.get("struggling_students", 0) / max_struggle
            mastery_flag = 1.0 if lesson in student_sous_acquis else 0.0
            
            node_features.append([
                bloom_norm,
                in_deg_norm, 
                out_deg_norm,
                struggle_norm,
                mastery_flag
            ])
        
        return torch.tensor(node_features, dtype=torch.float)
    
    def train_for_student(self, student_sous_acquis, epochs=200, lr=0.01, verbose=False):
        """Entraîne le modèle pour un étudiant spécifique"""
        try:
            # Préparer les données
            x = self._build_node_features(student_sous_acquis)
            data = Data(x=x, edge_index=self.edge_index)
            
            # Initialiser le modèle
            self.model = LessonGCN(in_dim=x.size(1))
            optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
            
            # Target : 1.0 pour les cours non-maîtrisés, 0.0 pour les maîtrisés
            y = torch.tensor([1.0 if lesson in student_sous_acquis else 0.0 
                             for lesson in self.lesson_labels], dtype=torch.float)
            
            # Boucle d'entraînement
            self.model.train()
            for epoch in range(epochs):
                optimizer.zero_grad()
                out = self.model(data)
                loss = F.mse_loss(out, y)
                loss.backward()
                optimizer.step()
                
                if verbose and epoch % 50 == 0:
                    print(f"Epoch {epoch}, loss = {loss.item():.4f}")
                    
        except Exception as e:
            print(f"❌ Erreur lors de l'entraînement: {e}")
            raise
    
    def get_recommendations(self, student_data, max_recommendations=5):
        """Génère des recommandations pour un étudiant"""
        if not self.enriched_data or not self.lesson_labels:
            raise ValueError("Les données ne sont pas chargées correctement")
        
        student_id = student_data.get("student_id", "unknown")
        sous_acquis = set(student_data.get("sous_acquis", []))
        
        # Entraîner le modèle pour cet étudiant
        self.train_for_student(sous_acquis, verbose=False)
        
        # Prédictions
        x = self._build_node_features(sous_acquis)
        data = Data(x=x, edge_index=self.edge_index)
        
        self.model.eval()
        with torch.no_grad():
            scores = self.model(data)
            # Appliquer sigmoid pour avoir des scores entre 0 et 1
            scores = torch.sigmoid(scores)
        
        # Filtrer les recommandations
        recommendations = []
        for i, lesson in enumerate(self.lesson_labels):
            if lesson in sous_acquis:  # Cours non-maîtrisé
                if self._prerequisites_mastered(lesson, sous_acquis):
                    lesson_data = self.enriched_data[lesson]
                    recommendations.append({
                        'lesson_id': lesson,
                        'lesson_name': lesson_data.get('name', lesson),
                        'priority_score': float(scores[i].item()),
                        'bloom_level': lesson_data.get('bloom_level', 1),
                        'prerequisites': self._get_prerequisites(lesson),
                        'difficulty_indicators': {
                            'struggling_students': lesson_data.get('struggling_students', 0),
                            'bloom_level': lesson_data.get('bloom_level', 1)
                        }
                    })
        
        # Trier par priorité et limiter
        recommendations.sort(key=lambda x: x['priority_score'], reverse=True)
        
        # Générer toutes les prédictions si demandé
        all_predictions = []
        for i, lesson in enumerate(self.lesson_labels):
            lesson_data = self.enriched_data[lesson]
            all_predictions.append({
                'lesson_id': lesson,
                'lesson_name': lesson_data.get('name', lesson),
                'score': float(scores[i].item()),
                'status': 'needs_work' if lesson in sous_acquis else 'mastered'
            })
        
        return {
            'student_id': student_id,
            'total_non_mastered': len(sous_acquis),
            'eligible_for_study': len(recommendations),
            'recommendations': recommendations[:max_recommendations] if max_recommendations > 0 else recommendations,
            'all_predictions': all_predictions
        }
    
    def _prerequisites_mastered(self, lesson, sous_acquis):
        """Vérifie si les prérequis d'un cours sont maîtrisés"""
        if not self.forward_paths:
            return True  # Si pas de données de prérequis, considérer comme éligible
            
        prereqs = self.forward_paths.get(lesson, {}).get("immediate_dependencies", [])
        # Un prérequis est maîtrisé s'il N'est PAS dans sous_acquis
        return all(p not in sous_acquis for p in prereqs)
    
    def _get_prerequisites(self, lesson):
        """Récupère la liste des prérequis d'un cours"""
        if not self.forward_paths:
            return []
        return self.forward_paths.get(lesson, {}).get("immediate_dependencies", [])
    
    def get_model_info(self):
        """Retourne des informations sur le modèle"""
        return {
            'total_lessons': len(self.lesson_labels) if self.lesson_labels else 0,
            'total_edges': self.edge_index.shape[1] // 2 if hasattr(self, 'edge_index') else 0,
            'model_trained': self.model is not None,
            'available_data': {
                'enriched_data': bool(self.enriched_data),
                'graph_data': bool(self.graph_data), 
                'forward_paths': bool(self.forward_paths)
            }
        }
    
    def get_lesson_difficulty_analysis(self):
        """Analyse de la difficulté des cours"""
        if not self.enriched_data:
            return {}
            
        analysis = {
            'bloom_distribution': {},
            'struggling_students_stats': {
                'mean': 0,
                'max': 0,
                'min': 0,
                'total': 0
            },
            'most_difficult_lessons': []
        }
        
        # Distribution par niveau Bloom
        for lesson_data in self.enriched_data.values():
            level = lesson_data.get('bloom_level', 1)
            analysis['bloom_distribution'][level] = analysis['bloom_distribution'].get(level, 0) + 1
        
        # Statistiques des étudiants en difficulté
        struggling_counts = [data.get('struggling_students', 0) for data in self.enriched_data.values()]
        if struggling_counts:
            analysis['struggling_students_stats'] = {
                'mean': np.mean(struggling_counts),
                'max': max(struggling_counts),
                'min': min(struggling_counts),
                'total': sum(struggling_counts)
            }
        
        # Cours les plus difficiles
        lessons_by_difficulty = [
            {
                'lesson_id': lesson,
                'lesson_name': data.get('name', lesson),
                'struggling_students': data.get('struggling_students', 0),
                'bloom_level': data.get('bloom_level', 1)
            }
            for lesson, data in self.enriched_data.items()
        ]
        lessons_by_difficulty.sort(key=lambda x: x['struggling_students'], reverse=True)
        analysis['most_difficult_lessons'] = lessons_by_difficulty[:10]
        
        return analysis