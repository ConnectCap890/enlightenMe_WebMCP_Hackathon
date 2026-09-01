import random
from quizzes.models import QuestionBank, Quiz, QuizQuestion


def get_questions_from_bank(topic: str, difficulty: str, count: int = 5) -> list:
    """
    Pulls questions from QuestionBank collection.
    Used for hard difficulty questions.
    """
    questions = QuestionBank.objects(
        topic__icontains=topic,
        difficulty=difficulty
    ).limit(count)

    if not questions:
        questions = QuestionBank.objects(
            difficulty=difficulty
        ).limit(count)

    return list(questions)


def build_quiz_prompt(title: str, transcript: str, difficulty: str) -> str:
    """
    This builds prompt for ChatGPT to generate multiple choice questions. ChatGPT generates questions
    through WebMCP and generates a JSON array of questions.
    """
    difficulty_instructions = {
        'easy': (
            'Generate 5 easy multiple choice questions. '
            'Focus on basic definitions and simple concepts. '
            'Questions should be answerable by a beginner.'
        ),
        'medium': (
            'Generate 5 medium difficulty multiple choice questions. '
            'Focus on application of concepts and how things work. '
            'Require some understanding beyond just definitions.'
        ),
        'hard': (
            'Generate 5 hard multiple choice questions. '
            'Focus on edge cases, complexity analysis, '
            'and deep understanding of the topic. '
            'These should challenge even experienced learners.'
        ),
    }

    return (
        f'Topic: {title}\n\n'
        f'Context:\n{transcript[:2000]}\n\n'
        f'{difficulty_instructions[difficulty]}\n\n'
        f'Return ONLY a JSON array in this exact format:\n'
        f'[\n'
        f'  {{\n'
        f'    "question": "What is...?",\n'
        f'    "options": ["A", "B", "C", "D"],\n'
        f'    "correct": 0,\n'
        f'    "explanation": "Because...",\n'
        f'    "topic": "specific concept tested"\n'
        f'  }}\n'
        f']\n\n'
        f'correct is the index (0-3) of the correct option in options array.\n'
        f'Return nothing else. No preamble. Just the JSON array.'
    )


def save_quiz(lecture_id: str, user_id: str, difficulty: str, questions_data: list) -> Quiz:
    """
    Saves a generated quiz to MongoDB.
    Called after ChatGPT generates questions via WebMCP.
    """
    quiz = Quiz(
        lecture_id=lecture_id,
        user_id=user_id,
        difficulty=difficulty,
    )

    for q in questions_data:
        question = QuizQuestion(
            question=q['question'],
            options=q['options'],
            correct=q['correct'],
            explanation=q.get('explanation', ''),
            topic=q.get('topic', ''),
        )
        quiz.questions.append(question)

    quiz.save()
    return quiz


def calculate_score(quiz_id: str, answers: list) -> dict:
    """
    this is gradings happens. Comaprison of correct answer with user answers.
    """
    quiz = Quiz.objects(id=quiz_id).first()
    if not quiz:
        raise ValueError('Quiz not found')

    score       = 0
    weak_topics = []

    for index, question in enumerate(quiz.questions):
        if index >= len(answers):
            break

        user_answer = answers[index]

        if user_answer == question.correct:
            score += 1
        else:
            if question.topic:
                weak_topics.append(question.topic)

    total      = len(quiz.questions)
    percentage = round((score / total) * 100, 1) if total > 0 else 0

    return {
        'score':       score,
        'total':       total,
        'percentage':  percentage,
        'weak_topics': weak_topics,
        'difficulty':  quiz.difficulty,
    }


def get_weak_topics_summary(user_id: str) -> list:
    """
    Aggregates all progress records for a user.
    Returns ranked list of weak topics.
    """
    from users.models import Progress

    all_progress = Progress.objects(user_id=user_id)

    topic_counts = {}
    for record in all_progress:
        for weak in record.weak_topics:
            topic = weak.topic
            if topic in topic_counts:
                topic_counts[topic] += weak.wrong_count
            else:
                topic_counts[topic] = weak.wrong_count

    sorted_topics = sorted(
        topic_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )

    result = []
    for topic, count in sorted_topics:
        if count >= 3:
            priority = 'high'
        elif count >= 2:
            priority = 'medium'
        else:
            priority = 'low'

        result.append({
            'topic':       topic,
            'wrong_count': count,
            'priority':    priority,
        })

    return result