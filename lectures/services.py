from youtubesearchpython import VideosSearch
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url: str) -> str:
    if 'youtu.be' in url:
        return url.split('/')[-1].split('?')[0]
    elif 'watch?v=' in url:
        return url.split('watch?v=')[-1].split('&')[0]
    else:
        raise ValueError('Invalid YouTube URL format')


def fetch_transcript(video_id: str) -> str:
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return ' '.join([entry['text'] for entry in transcript_list])
    except Exception as e:
        raise ValueError(f'Could not fetch transcript: {str(e)}')


def fetch_video_details(video_id: str) -> dict:
    try:
        search  = VideosSearch(video_id, limit=1)
        results = search.result()['result']
        if not results:
            return {'title': 'Untitled Lecture', 'channel_name': 'Unknown Channel'}
        v = results[0]
        return {
            'title':        v['title'],
            'channel_name': v['channel']['name'],
        }
    except Exception:
        return {'title': 'Untitled Lecture', 'channel_name': 'Unknown Channel'}


def search_youtube_lectures(topic: str) -> list:
    try:
        search  = VideosSearch(f'{topic} lecture explained', limit=3)
        results = search.result()['result']
        return [
            {
                'video_id':    v['id'],
                'title':       v['title'],
                'channel':     v['channel']['name'],
                'description': v.get('descriptionSnippet', [{}])[0].get('text', '')[:200] if v.get('descriptionSnippet') else '',
                'url':         f"https://youtube.com/watch?v={v['id']}",
                'thumbnail':   v['thumbnails'][0]['url'] if v.get('thumbnails') else '',
            }
            for v in results
        ]
    except Exception as e:
        raise ValueError(f'Search failed: {str(e)}')