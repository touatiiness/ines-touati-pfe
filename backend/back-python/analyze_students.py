"""
Test rapide de l'extraction du quiz 1.1
"""

from pathlib import Path
from extract_quiz_from_pptx import extract_quiz_from_pptx

# Chemin vers le fichier quiz 1.1
quiz_file = Path("Support_Cours_Préparation/2/2.1/Quiz/if-else.docx")

print("="*80)
print(f"TEST D'EXTRACTION - {quiz_file}")
print("="*80)
print()

if not quiz_file.exists():
    print(f"❌ Fichier introuvable: {quiz_file}")
    exit(1)

print(f"📄 Fichier trouvé: {quiz_file.name}")
print(f"📂 Chemin complet: {quiz_file.absolute()}")
print()

# Extraction
result = extract_quiz_from_pptx(quiz_file)

if result['success']:
    print(f"✅ Extraction réussie!")
    print(f"   Nombre de questions: {result['total_questions']}")
    print()

    if result['total_questions'] > 0:
        print("📝 Questions extraites:")
        print("─"*80)
        for i, q in enumerate(result['questions'], 1):
            print(f"\n{i}. {q['question']}")
            print(f"   Options ({len(q['options'])}):")
            for opt in q['options']:
                print(f"      {opt}")
            if q['reponse_correcte']:
                print(f"   ✓ Réponse correcte: {q['reponse_correcte']}")

        print("\n" + "─"*80)
        print("\n📋 Contenu formaté pour l'IA:")
        print("─"*80)
        print(result['formatted_content'])
        print("─"*80)

        print("\n✅ Le quiz devrait maintenant apparaître dans l'application!")
    else:
        print("⚠️  Aucune question extraite")
        print("   Vérifiez le format du fichier Word")
else:
    print(f"❌ Erreur lors de l'extraction:")
    print(f"   {result['error']}")
    print()
    print("💡 Suggestions:")
    print("   - Vérifiez que python-docx est installé: pip install python-docx")
    print("   - Vérifiez le format du fichier (doit être .docx, pas .doc)")
    print("   - Vérifiez que les questions sont numérotées et les options A), B), C), D)")
