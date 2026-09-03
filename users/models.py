from mongoengine import (
    Document, StringField, ListField, IntField,
    FloatField, DateTimeField,
    EmbeddedDocument, EmbeddedDocumentField
)
from datetime import datetime
import hashlib
import os


class User(Document):
    username   = StringField(required=True, unique=True, max_length=50)
    email      = StringField(required=True, unique=True, max_length=200)
    password   = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'users',
        'indexes': ['username', 'email'],
    }

    def set_password(self, raw_password: str):
        salt = os.urandom(16).hex()
        hashed = hashlib.sha256(f"{salt}{raw_password}".encode()).hexdigest()
        self.password = f"{salt}${hashed}"

    def check_password(self, raw_password: str) -> bool:
        try:
            salt, hashed = self.password.split('$')
            return hashed == hashlib.sha256(
                f"{salt}{raw_password}".encode()
            ).hexdigest()
        except Exception:
            return False

    def to_dict(self):
        return {
            'id':         str(self.id),
            'username':   self.username,
            'email':      self.email,
            'created_at': self.created_at.isoformat(),
        }
    @property
    def is_authenticated(self) -> bool:
        # DRF/Django checks this attribute on request.user
        return True

    @property
    def is_anonymous(self) -> bool:
        return False

    @property
    def is_active(self) -> bool:
        # Return False here if you implement account disabling
        return True

    def __str__(self) -> str:
        return self.username


class WeakTopic(EmbeddedDocument):
    topic       = StringField(required=True, max_length=100)
    wrong_count = IntField(default=1)


class Progress(Document):
    user_id      = StringField(required=True)
    quiz_id      = StringField(required=True)
    lecture_id   = StringField(required=True)
    difficulty   = StringField(required=True, choices=['easy', 'medium', 'hard'])
    score        = IntField(required=True)
    total        = IntField(required=True)
    percentage   = FloatField(required=True)
    weak_topics  = ListField(EmbeddedDocumentField(WeakTopic), default=list)
    completed_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'progress',
        'indexes': ['user_id', 'lecture_id'],
        'ordering': ['-completed_at'],
    }

    def to_dict(self):
        return {
            'id':           str(self.id),
            'user_id':      self.user_id,
            'quiz_id':      self.quiz_id,
            'lecture_id':   self.lecture_id,
            'difficulty':   self.difficulty,
            'score':        self.score,
            'total':        self.total,
            'percentage':   self.percentage,
            'weak_topics':  [
                {'topic': wt.topic, 'wrong_count': wt.wrong_count}
                for wt in self.weak_topics
            ],
            'completed_at': self.completed_at.isoformat(),
        }
