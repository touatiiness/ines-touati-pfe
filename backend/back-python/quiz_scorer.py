"""
Système de scoring des quiz et identification des sous-acquis
"""

import json
import os
from datetime import datetime
from pathlib import Path

class QuizScorer:
    """Gère le scoring des quiz et l'identification des sous-acquis non maîtrisés"""

    # Mapping cours → sous-acquis
    # Chaque cours correspond à un sous-acquis spécifique
    COURSE_TO_SUBSKILL = {
        (1, 1): "1.1",  # Cours 1, Partie 1 → Sous-acquis 1.1
        (1, 2): "1.2",
        (1, 3): "1.3",
        (1, 4): "1.4",
        (1, 5): "1.5",
        (1, 6): "1.6",
        (1, 7): "1.7",
        (2, 1): "2.1",
        (2, 2): "2.2",
        (2, 3): "2.3",
        (3, 1): "3.1",
        (3, 2): "3.2",
        (3, 3): "3.3",
        (3, 4): "3.4",
        (4, 1): "4.1",
        (4, 2): "4.2",
        (4, 3): "4.3",
        (4, 4): "4.4",
        (4, 5): "4.5",
        (4, 6): "4.6",
        (4, 7): "4.7",
        (4, 8): "4.8",
        (4, 9): "4.9",
        (5, 1): "5.1",
        (5, 2): "5.2",
        (5, 3): "5.3",
        (5, 4): "5.4",
        (5, 5): "5.5",
        (5, 6): "5.6",
        (5, 7): "5.7",
        (6, 1): "6.1",
        (6, 2): "6.2",
        (6, 3): "6.3",
        (7, 1): "7.1",
        (7, 2): "7.2",
        (7, 3): "7.3",
        (8, 1): "8.1",
        (8, 2): "8.2",
        (8, 3): "8.3",
        (8, 4): "8.4",
        (8, 5): "8.5",
        (8, 6): "8.6",
    }

    # Seuil de réussite (score minimum pour considérer un cours comme maîtrisé)
    MASTERY_THRESHOLD = 0.80  # 80%

    def __init__(self, data_dir="./"):
        self.data_dir = data_dir
        self.students_file = os.path.join(data_dir, "students_profiles.json")
        self.results_file = os.path.join(data_dir, "quiz_results.json")

        # Charger ou créer les fichiers de données
        self.students_data = self._load_students()
        self.results_data = self._load_results()

    def _load_students(self):
        """Charge le fichier students_profiles.json"""
        if os.path.exists(self.students_file):
            try:
                with open(self.students_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ Erreur lors du chargement de {self.students_file}: {e}")
                return []
        return []

    def _load_results(self):
        """Charge l'historique des résultats de quiz"""
        if os.path.exists(self.results_file):
            try:
                with open(self.results_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ Erreur lors du chargement de {self.results_file}: {e}")
                return []
        return []

    def _save_students(self):
        """Sauvegarde students_profiles.json"""
        try:
            with open(self.students_file, 'w', encoding='utf-8') as f:
                json.dump(self.students_data, f, indent=4, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde de {self.students_file}: {e}")
            return False

    def _save_results(self):
        """Sauvegarde quiz_results.json"""
        try:
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(self.results_data, f, indent=4, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde de {self.results_file}: {e}")
            return False

    def calculate_score(self, total_questions, correct_answers):
        """Calcule le score en pourcentage"""
        if total_questions == 0:
            return 0.0
        return correct_answers / total_questions

    def evaluate_quiz(self, student_id, course_number, part_number,
                     total_questions, correct_answers):
        """
        Évalue un quiz et met à jour le profil de l'étudiant

        Args:
            student_id: ID de l'étudiant
            course_number: Numéro du cours (1-8)
            part_number: Numéro de la partie (1-N)
            total_questions: Nombre total de questions
            correct_answers: Nombre de réponses correctes

        Returns:
            dict avec score, sous-acquis affecté, et recommandation
        """
        # Calculer le score
        score = self.calculate_score(total_questions, correct_answers)
        percentage = score * 100

        # Identifier le sous-acquis correspondant
        subskill_id = self.COURSE_TO_SUBSKILL.get((course_number, part_number))
        if not subskill_id:
            return {
                "error": f"Mapping non trouvé pour Cours {course_number}.{part_number}",
                "score": score,
                "percentage": percentage
            }

        # Déterminer si le cours est maîtrisé
        is_mastered = score >= self.MASTERY_THRESHOLD

        # Enregistrer le résultat
        result_entry = {
            "student_id": student_id,
            "course": f"{course_number}.{part_number}",
            "subskill_id": subskill_id,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "score": score,
            "percentage": percentage,
            "is_mastered": is_mastered,
            "timestamp": datetime.now().isoformat()
        }
        self.results_data.append(result_entry)
        self._save_results()

        # Mettre à jour le profil de l'étudiant
        student_updated = self._update_student_profile(
            student_id, subskill_id, is_mastered
        )

        return {
            "student_id": student_id,
            "course": f"{course_number}.{part_number}",
            "subskill_id": subskill_id,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "score": score,
            "percentage": percentage,
            "is_mastered": is_mastered,
            "threshold": self.MASTERY_THRESHOLD * 100,
            "student_profile_updated": student_updated,
            "message": self._get_feedback_message(score)
        }

    def _update_student_profile(self, student_id, subskill_id, is_mastered):
        """Met à jour le profil de l'étudiant dans students_profiles.json"""
        # Chercher l'étudiant
        student = None
        for s in self.students_data:
            if s["student_id"] == student_id:
                student = s
                break

        # Créer l'étudiant s'il n'existe pas
        if not student:
            student = {
                "student_id": student_id,
                "sous_acquis": []
            }
            self.students_data.append(student)

        # Mettre à jour la liste des sous-acquis
        if not is_mastered:
            # Ajouter le sous-acquis s'il n'est pas déjà dans la liste
            if subskill_id not in student["sous_acquis"]:
                student["sous_acquis"].append(subskill_id)
        else:
            # Retirer le sous-acquis s'il était dans la liste
            if subskill_id in student["sous_acquis"]:
                student["sous_acquis"].remove(subskill_id)

        # Sauvegarder
        return self._save_students()

    def _get_feedback_message(self, score):
        """Génère un message de feedback selon le score"""
        percentage = score * 100

        if percentage >= 90:
            return "🎉 Excellent ! Vous maîtrisez parfaitement ce cours !"
        elif percentage >= 80:
            return "✅ Très bien ! Vous avez validé ce cours."
        elif percentage >= 70:
            return "👍 Bon travail ! Encore un petit effort pour maîtriser ce cours."
        elif percentage >= 60:
            return "⚠️ Passable. Il serait bon de réviser ce cours."
        elif percentage >= 50:
            return "⚠️ Insuffisant. Ce cours nécessite plus de travail."
        else:
            return "❌ Résultat faible. Il est recommandé de réviser ce cours en profondeur."

    def get_student_profile(self, student_id):
        """Récupère le profil complet d'un étudiant"""
        for student in self.students_data:
            if student["student_id"] == student_id:
                return student

        # Créer un nouveau profil si l'étudiant n'existe pas
        return {
            "student_id": student_id,
            "sous_acquis": []
        }

    def get_student_history(self, student_id):
        """Récupère l'historique des quiz d'un étudiant"""
        history = [r for r in self.results_data if r["student_id"] == student_id]
        # Trier par date (plus récent en premier)
        history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return history

    def get_statistics(self, student_id=None):
        """Obtient des statistiques globales ou pour un étudiant"""
        if student_id:
            results = [r for r in self.results_data if r["student_id"] == student_id]
        else:
            results = self.results_data

        if not results:
            return {
                "total_quizzes": 0,
                "average_score": 0,
                "mastered_count": 0,
                "not_mastered_count": 0
            }

        total = len(results)
        avg_score = sum(r["score"] for r in results) / total
        mastered = sum(1 for r in results if r["is_mastered"])
        not_mastered = total - mastered

        return {
            "total_quizzes": total,
            "average_score": avg_score,
            "average_percentage": avg_score * 100,
            "mastered_count": mastered,
            "not_mastered_count": not_mastered,
            "mastery_rate": (mastered / total * 100) if total > 0 else 0
        }


# Fonction helper pour utilisation dans l'API
def evaluate_quiz_result(student_id, course_number, part_number,
                        total_questions, correct_answers, data_dir="./"):
    """
    Fonction helper pour évaluer un quiz depuis l'API
    """
    scorer = QuizScorer(data_dir)
    return scorer.evaluate_quiz(
        student_id, course_number, part_number,
        total_questions, correct_answers
    )
