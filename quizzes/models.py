from mongoengine import (
    Document, StringField, ListField, IntField, DateTimeField,EmbeddedDocument,EmbeddedDocumentField
)

from datetime import datetime

class QuestionBank(Document):

    topic       = StringField(required=True, max_length=100)
    difficulty  = StringField(required=True, choices=['easy', 'medium', 'hard'])
    question    = StringField(required=True, max_length=600)
    options     = ListField(StringField(max_length=200))
    correct     = IntField(required=True)
    explanation = StringField(default='', max_length=500)
    source      = StringField(default='custom', max_length=100)

    meta = {
        'collection': 'question_bank',
        'indexes': ['topic', 'difficulty'],
    }

    def to_dict(self):
        return {
            'id':          str(self.id),
            'topic':       self.topic,
            'difficulty':  self.difficulty,
            'question':    self.question,
            'options':     self.options,
            'correct':     self.correct,
            'explanation': self.explanation,
            'source':      self.source,
        }

class QuizQuestion(EmbeddedDocument):

    question    = StringField(required=True, max_length=600)
    options     = ListField(StringField(max_length=200))
    correct     = IntField(required=True)
    explanation = StringField(default='', max_length=500)
    topic       = StringField(default='', max_length=100)

class Quiz(Document):
    lecture_id  = StringField(required=True)
    user_id     = StringField(required=True)
    difficulty  = StringField(required=True, choices=['easy', 'medium', 'hard'])
    questions   = ListField(EmbeddedDocumentField(QuizQuestion), default=list)
    created_at  = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'quizzes',
        'indexes': ['lecture_id', 'user_id'],
        'ordering': ['-created_at'],
    }

    def to_dict(self):
        return {
            'id':         str(self.id),
            'lecture_id': self.lecture_id,
            'user_id':    self.user_id,
            'difficulty': self.difficulty,
            'questions':  [
                {
                    'question':    q.question,
                    'options':     q.options,
                    'correct':     q.correct,
                    'explanation': q.explanation,
                    'topic':       q.topic,
                }
                for q in self.questions
            ],
            'created_at': self.created_at.isoformat(),
        }

        