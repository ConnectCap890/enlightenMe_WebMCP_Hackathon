import requests

from youtube_transcript_api import YouTubeTranscriptApi
from django.conf import settings

def extract_video_id(url: str) -> str:

    if 'youtu.be' in url:
        return url.split('/')[-1].split('?')[0]
    elif 'watch?v=' in url:
        return url.split('watch?v=')[-1].split('&')[0]
    else:
        raise ValueError('Invalid YouTube URL formate')

def fetch_transcript(video_id: str) -> str:

       try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return ' '.join([entry['text'] for entry in transcript_list])
       except Exception as e:
        raise ValueError(f'Could not fetch transcript: {str(e)}')  

def fetch_video_details(video_id: str) -> dict:
    api_key = settings.YOUTUBE_API_KEY
    if not api_key or api_key == 'WILL_ADD_LATER':
        return {
            'title':        'Untitled Lecture',
            'channel_name': 'Unknown Channel',
        }
    url = (
        f'https://www.googleapis.com/youtube/v3/videos'
        f'?part=snippet&id={video_id}&key={api_key}'
    )
    response = requests.get(url)
    data = response.json()
    if not data.get('items'):
        raise ValueError('Video not found')
    snippet = data['items'][0]['snippet']
    return {
        'title':        snippet['title'],
        'channel_name': snippet['channelTitle'],
    }


def search_youtube_lectures(topic: str) -> list:
    api_key = settings.YOUTUBE_API_KEY
    if not api_key or api_key == 'WILL_ADD_LATER':
        return [{
            'video_id':    'placeholder',
            'title':       f'{topic} — placeholder video',
            'channel':     'Test Channel',
            'description': 'Add YouTube API key to see real results',
            'url':         'https://youtube.com',
            'thumbnail':   '',
        }]
    url = (
        f'https://www.googleapis.com/youtube/v3/search'
        f'?part=snippet'
        f'&q={topic}+lecture+explained'
        f'&type=video'
        f'&maxResults=3'
        f'&relevanceLanguage=en'
        f'&key={api_key}'
    )
    response = requests.get(url)
    data = response.json()
    results = []
    for item in data.get('items', []):
        video_id = item['id']['videoId']
        snippet  = item['snippet']
        results.append({
            'video_id':    video_id,
            'title':       snippet['title'],
            'channel':     snippet['channelTitle'],
            'description': snippet['description'][:200],
            'url':         f'https://youtube.com/watch?v={video_id}',
            'thumbnail':   snippet['thumbnails']['medium']['url'],
        })
    return results                                           