import json
from collections import defaultdict

# -------------------
# Load base JSON files
# -------------------
with open("graph_data.json") as f:
    graph_data = json.load(f)

with open("students_profiles.json") as f:
    students_data = json.load(f)

# Bloom taxonomy data (inline for now)
bloom_data = {
    "1.1": 1, "1.2": 2, "1.3": 3, "1.4": 4, "1.5": 3, "1.6": 3, "1.7": 5,
    "2.1": 3, "2.2": 3, "2.3": 4, "3.1": 3, "3.2": 3, "3.3": 3, "3.4": 4,
    "4.1": 1, "4.2": 3, "4.3": 3, "4.4": 3, "4.5": 3, "4.6": 4, "4.7": 3,
    "4.8": 1, "4.9": 3, "5.1": 1, "5.2": 3, "5.3": 3, "5.4": 3, "6.1": 1,
    "6.2": 3, "6.3": 3, "7.1": 1, "7.2": 3, "7.3": 3, "8.1": 1, "8.2": 3,
    "8.3": 3, "8.4": 4, "8.5": 4, "8.6": 3
}
bloom_norm = {k: v/5.0 for k, v in bloom_data.items()}

# Lesson name mapping (you gave me this list earlier)
subchapter_names = {
    "1.1": "Lister les étapes pour passer d'un code source à un exécutable",
    "1.2": "Décrire la structure d'un programme C",
    "1.3": "Utiliser les variables",
    "1.4": "Examiner la portée d'une variable",
    "1.5": "Pratiquer les fonctions d'entrées / sorties",
    "1.6": "Utiliser les opérateurs arithmétiques et logiques",
    "1.7": "Ordonner les opérateurs arithmétiques et logiques",
    "2.1": "Reconnaître la structure if else",
    "2.2": "Reconnaître la structures switch",
    "2.3": "Distinguer les structures conditionnelles ( if, if else et switch ) du langage C",
    "3.1": "Reconnaître la boucle for",
    "3.2": "Reconnaître la boucle do while",
    "3.3": "Reconnaître la boucle while",
    "3.4": "Différencier les structures itératives",
    "4.1": "Définir un tableau",
    "4.2": "Pratiquer l'opération d'ajout",
    "4.3": "Pratiquer l'opération de suppression",
    "4.4": "Pratiquer l'opération de parcours",
    "4.5": "Appliquer la recherche séquentielle",
    "4.6": "Ordonner un tableau",
    "4.7": "Appliquer la recherche dichotomique",
    "4.8": "Identifier les types des tableaux",
    "4.9": "Appliquer une structure itérative pour le parcours d'un tableau bidimentionnel",
    "5.1": "Définir une chaîne de caractères",
    "5.2": "Utiliser les fonctions prédéfinies de String.h",
    "6.1": "Définir une structure avec des champs",
    "6.2": "Utiliser une variable de type structure",
    "6.3": "Définir un alias sur une structure via typedef",
    "7.1": "Définir une fonction",
    "7.2": "Identifier les composantes d'une fonction",
    "7.3": "Distinguer les modes de passage des paramètres d'une fonction",
    "8.1": "Définir un pointeur",
    "8.2": "Utiliser les pointeurs dans les prototypes des fonctions",
    "8.3": "Appliquer les pointeurs pour la manipulation des tableaux",
    "8.4": "…",
    "8.5": "…",
    "8.6": "…"
}

# -------------------
# Compute degrees
# -------------------
nodes = graph_data["nodes"]
links = graph_data["links"]

in_degree = defaultdict(int)
out_degree = defaultdict(int)

for link in links:
    s = int(link["source"])
    t = int(link["target"])
    src_label = nodes[s]["label"]
    tgt_label = nodes[t]["label"]
    out_degree[src_label] += 1
    in_degree[tgt_label] += 1

# -------------------
# Count struggling students per subchapter
# -------------------
struggling_counts = defaultdict(int)
for student in students_data:
    for sub in student.get("sous_acquis", []):
        struggling_counts[sub] += 1

# -------------------
# Build enriched features
# -------------------
enriched_nodes = {}
for node in nodes:
    label = node["label"]
    enriched_nodes[label] = {
        "name": subchapter_names.get(label, "Unknown"),
        "in_degree": in_degree[label],
        "out_degree": out_degree[label],
        "struggling_students": struggling_counts[label],
        "bloom_level": bloom_data.get(label, 0),
        "bloom_norm": bloom_norm.get(label, 0.0)
    }

# -------------------
# Save to JSON
# -------------------
with open("enriched_graph.json", "w", encoding="utf-8") as f:
    json.dump(enriched_nodes, f, indent=4, ensure_ascii=False)

print("✅ Enriched graph saved to enriched_graph.json")
