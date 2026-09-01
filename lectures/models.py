from mongoengine import (
    Document, StringField, ListField,
    DateTimeField, EmbeddedDocument, EmbeddedDocumentField
)
from datetime import datetime


class KeyConcept(EmbeddedDocument):
    title       = StringField(required=True, max_length=200)
    explanation = StringField(required=True, max_length=500)


class Lecture(Document):
    user_id        = StringField(required=True)
    title          = StringField(required=True, max_length=200)
    source         = StringField(required=True, choices=['youtube', 'chatgpt'])
    youtube_url    = StringField(default='')
    transcript     = StringField(default='')
    plain_english  = StringField(default='')
    technical      = StringField(default='')
    advanced       = StringField(default='')
    key_concepts   = ListField(EmbeddedDocumentField(KeyConcept), default=list)
    related_topics = ListField(StringField(max_length=100), default=list)
    created_at     = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'lectures',
        'indexes': ['user_id', 'created_at'],
        'ordering': ['-created_at'],
    }

    def to_dict(self):
        return {
            'id':             str(self.id),
            'user_id':        self.user_id,
            'title':          self.title,
            'source':         self.source,
            'youtube_url':    self.youtube_url,
            'plain_english':  self.plain_english,
            'technical':      self.technical,
            'advanced':       self.advanced,
            'key_concepts':   [
                {'title': kc.title, 'explanation': kc.explanation}
                for kc in self.key_concepts
            ],
            'related_topics': self.related_topics,
            'created_at':     self.created_at.isoformat(),
        }


