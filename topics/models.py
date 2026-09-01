from mongoengine import(
    Document,StringField,ListField,DateTimeField,EmbeddedDocument,EmbeddedDocumentField
)
from datetime import datetime

class KeyConcept(EmbeddedDocument):
    title = StringField(required=True,max_length=100)
    explanation = StringField(required=True,max_length=500)

class Lecture(Document):
    user_id = StringField(required=True)
    title = StringField(required=True,max_length=200)
    youtube_url = StringField(required=True,max_length=300)
    transcript = StringField(default='')
    summary = StringField(default= '')
    key_concepts = ListField(EmbeddedDocumentField(KeyConcept),default=list)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'lectures',
        'indexes':['user_id','title'],
        'ordering': ['-created_at'],
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': self.user_id,
            'title': self.title,
            'youtube_url': self.youtube_url,
            'transcript': self.transcript,
            'summary': self.summary,
            'key_concepts': [
                {'title': kc.title, 'explanation': kc.explanation}
                for kc in self.key_concepts
                 ],
            'created_at': self.created_at.isoformat(),     
        }


