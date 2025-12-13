"""
Routes API pour le système de recommandation intelligent
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from quiz_scorer import QuizScorer, evaluate_quiz_result

# Essayer d'importer le recommender, sinon créer un fallback
try:
    from gcn_recommender import GCNRecommender
    GCN_AVAILABLE = True
except ImportError:
    GCN_AVAILABLE = False
    print("WARNING: GCN Recommender non disponible. Installez PyTorch et torch-geometric.")

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])
logger = logging.getLogger(__name__)

# Models Pydantic
class QuizResult(BaseModel):
    student_id: str
    course_number: int
    part_number: int
    total_questions: int
    correct_answers: int

class RecommendationRequest(BaseModel):
    student_id: str
    max_recommendations: Optional[int] = 5

# Instance globale du scorer
scorer = QuizScorer(data_dir=".")

# Instance globale du recommender (si disponible)
recommender = None
if GCN_AVAILABLE:
    try:
        recommender = GCNRecommender(data_dir=".")
        logger.info("✅ GCN Recommender initialisé")
    except Exception as e:
        logger.warning(f"⚠️ Impossible d'initialiser le GCN Recommender: {e}")


@router.post("/evaluate-quiz")
async def evaluate_quiz(result: QuizResult):
    """
    Évalue un quiz et met à jour le profil de l'étudiant

    Retourne:
    - Score et pourcentage
    - Si le cours est maîtrisé ou non
    - Mise à jour du profil étudiant
    - Message de feedback
    """
    try:
        logger.info(f"📝 Évaluation quiz: Étudiant {result.student_id}, Cours {result.course_number}.{result.part_number}")

        evaluation = scorer.evaluate_quiz(
            student_id=result.student_id,
            course_number=result.course_number,
            part_number=result.part_number,
            total_questions=result.total_questions,
            correct_answers=result.correct_answers
        )

        if "error" in evaluation:
            raise HTTPException(status_code=400, detail=evaluation["error"])

        logger.info(f"✅ Score: {evaluation['percentage']:.1f}% - Maîtrisé: {evaluation['is_mastered']}")

        return evaluation

    except Exception as e:
        logger.error(f"❌ Erreur lors de l'évaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/student/{student_id}/profile")
async def get_student_profile(student_id: str):
    """
    Récupère le profil complet d'un étudiant

    Retourne:
    - Liste des sous-acquis non maîtrisés
    - Statistiques globales
    - Historique des quiz
    """
    try:
        profile = scorer.get_student_profile(student_id)
        history = scorer.get_student_history(student_id)
        stats = scorer.get_statistics(student_id)

        return {
            "student_id": student_id,
            "sous_acquis": profile.get("sous_acquis", []),
            "total_non_mastered": len(profile.get("sous_acquis", [])),
            "statistics": stats,
            "recent_quizzes": history[:10]  # 10 derniers quiz
        }

    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération du profil: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/student/{student_id}/recommendations")
async def get_recommendations(student_id: str, max_recommendations: int = 5):
    """
    Génère des recommandations personnalisées pour un étudiant

    Utilise le GCN pour analyser:
    - Les sous-acquis non maîtrisés
    - Les dépendances entre cours
    - La difficulté des cours
    - Les résultats des autres étudiants

    Retourne:
    - Top N cours recommandés
    - Score de priorité pour chaque cours
    - Prérequis et indicateurs de difficulté
    """
    if not GCN_AVAILABLE or not recommender:
        return {
            "error": "Système de recommandation non disponible",
            "fallback": "Veuillez installer PyTorch et torch-geometric",
            "student_id": student_id,
            "recommendations": []
        }

    try:
        logger.info(f"🤖 Génération de recommandations pour {student_id}")

        # Récupérer le profil de l'étudiant
        profile = scorer.get_student_profile(student_id)

        if not profile.get("sous_acquis"):
            return {
                "student_id": student_id,
                "message": "🎉 Félicitations ! Vous avez maîtrisé tous les cours disponibles.",
                "total_non_mastered": 0,
                "recommendations": []
            }

        # Générer les recommandations avec le GCN
        recommendations = recommender.get_recommendations(
            student_data=profile,
            max_recommendations=max_recommendations
        )

        logger.info(f"✅ {len(recommendations.get('recommendations', []))} recommandations générées")

        return recommendations

    except Exception as e:
        logger.error(f"❌ Erreur lors de la génération des recommandations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/student/{student_id}/statistics")
async def get_student_statistics(student_id: str):
    """
    Retourne les statistiques détaillées d'un étudiant
    """
    try:
        stats = scorer.get_statistics(student_id)
        profile = scorer.get_student_profile(student_id)

        return {
            "student_id": student_id,
            "statistics": stats,
            "current_non_mastered": len(profile.get("sous_acquis", [])),
            "mastery_threshold": scorer.MASTERY_THRESHOLD * 100
        }

    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des statistiques: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model-info")
async def get_model_info():
    """
    Informations sur le modèle de recommandation
    """
    if not GCN_AVAILABLE or not recommender:
        return {
            "gcn_available": False,
            "message": "GCN non disponible - Installez PyTorch et torch-geometric"
        }

    try:
        model_info = recommender.get_model_info()
        difficulty_analysis = recommender.get_lesson_difficulty_analysis()

        return {
            "gcn_available": True,
            "model_info": model_info,
            "difficulty_analysis": difficulty_analysis,
            "mastery_threshold": scorer.MASTERY_THRESHOLD * 100
        }

    except Exception as e:
        logger.error(f"❌ Erreur: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/global-statistics")
async def get_global_statistics():
    """
    Statistiques globales de tous les étudiants
    """
    try:
        stats = scorer.get_statistics()
        total_students = len(scorer.students_data)

        # Analyser les sous-acquis les plus problématiques
        all_sous_acquis = []
        for student in scorer.students_data:
            all_sous_acquis.extend(student.get("sous_acquis", []))

        from collections import Counter
        sous_acquis_counts = Counter(all_sous_acquis)
        most_difficult = [
            {"subskill": sk, "student_count": count}
            for sk, count in sous_acquis_counts.most_common(10)
        ]

        return {
            "total_students": total_students,
            "quiz_statistics": stats,
            "most_difficult_subskills": most_difficult
        }

    except Exception as e:
        logger.error(f"❌ Erreur: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
