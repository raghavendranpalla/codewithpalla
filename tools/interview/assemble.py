# Assemble the mock-interview video: ElevenLabs TTS + ffmpeg.
# Usage: python assemble.py --voice VOICE_ID [--only intro,q01,a01] [--out video.mp4]
import argparse, io, json, os, subprocess, sys, winreg

HERE = os.path.dirname(os.path.abspath(__file__))
SLIDES = os.path.join(HERE, 'slides')
AUDIO = os.path.join(HERE, 'audio')
SEGS = os.path.join(HERE, 'segs')
# ffmpeg dir: set FFMPEG_DIR env var to a bin folder, else expect ffmpeg on PATH
FF = os.environ.get('FFMPEG_DIR', '')
FFMPEG = os.path.join(FF, 'ffmpeg.exe') if FF else 'ffmpeg'
FFPROBE = os.path.join(FF, 'ffprobe.exe') if FF else 'ffprobe'
FONT = 'consolab.ttf'  # copied into HERE; ffmpeg runs with cwd=HERE to dodge C:\ escaping
TIMER_SECONDS = 20

VENC = ['-c:v', 'libx264', '-preset', 'medium', '-tune', 'stillimage',
        '-pix_fmt', 'yuv420p', '-r', '30', '-video_track_timescale', '15360']
AENC = ['-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2']


def api_key():
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, 'Environment') as k:
        return winreg.QueryValueEx(k, 'ELEVANLABS')[0]


def tts(text, voice, out):
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        return False  # cached
    import requests
    r = requests.post(
        f'https://api.elevenlabs.io/v1/text-to-speech/{voice}',
        params={'output_format': 'mp3_44100_128'},
        headers={'xi-api-key': api_key()},
        json={'text': text, 'model_id': 'eleven_multilingual_v2',
              'voice_settings': {'stability': 0.45, 'similarity_boost': 0.85,
                                 'style': 0.35, 'speed': 0.9,
                                 'use_speaker_boost': True}},
        timeout=300)
    if r.status_code != 200:
        sys.exit(f'TTS failed ({r.status_code}): {r.text[:400]}')
    io.open(out, 'wb').write(r.content)
    return True


def dur(path):
    out = subprocess.run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration',
                          '-of', 'csv=p=0', path], capture_output=True, text=True)
    return float(out.stdout.strip())


def run(args):
    p = subprocess.run(args, capture_output=True, text=True, cwd=HERE)
    if p.returncode != 0:
        sys.exit('ffmpeg failed:\n' + p.stderr[-2000:])


def seg_narrated(png, mp3, out, static_45=False):
    d = dur(mp3) + 1.2
    vf = []
    if static_45:
        vf = ['-vf', f"drawtext=fontfile={FONT}:text='{TIMER_SECONDS}':fontsize=96:"
                     f"fontcolor=0x22d3ee:x=1060-text_w/2:y=450-text_h/2"]
    run([FFMPEG, '-y', '-v', 'error', '-loop', '1', '-i', png, '-i', mp3,
         '-af', 'apad', '-t', f'{d:.2f}'] + vf + VENC + AENC + [out])


def seg_timer(png, out):
    t = TIMER_SECONDS
    beep = (f'aevalsrc=0.15*sin(2*PI*880*t)*between(mod(t\\,1)\\,0\\,0.12)*gte(t\\,{t-3})'
            f':s=44100:d={t}')
    vf = (f"drawtext=fontfile={FONT}:text='%{{eif\\:ceil({t}-t)\\:d}}':fontsize=96:"
          f"fontcolor=0x22d3ee:x=1060-text_w/2:y=450-text_h/2")
    run([FFMPEG, '-y', '-v', 'error', '-loop', '1', '-i', png,
         '-f', 'lavfi', '-i', beep, '-vf', vf, '-t', str(t)] + VENC + AENC + [out])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice', required=True)
    ap.add_argument('--only', default='')
    ap.add_argument('--out', default='interview-practice-1.mp4')
    a = ap.parse_args()
    os.makedirs(AUDIO, exist_ok=True)
    os.makedirs(SEGS, exist_ok=True)
    font_dst = os.path.join(HERE, 'consolab.ttf')
    if not os.path.exists(font_dst):
        import shutil
        shutil.copy(r'C:\Windows\Fonts\consolab.ttf', font_dst)

    items = json.load(io.open(os.path.join(HERE, 'manifest.json'), encoding='utf-8'))
    if a.only:
        keep = set(a.only.split(','))
        items = [x for x in items if x['id'] in keep]

    order = []
    for x in items:
        png = os.path.join(SLIDES, x['slide'])
        mp3 = os.path.join(AUDIO, x['id'] + '.mp3')
        fresh = tts(x['narr'], a.voice, mp3)
        print(('tts  ' if fresh else 'cache') + '  ' + x['id'], flush=True)
        seg = os.path.join(SEGS, x['id'] + '.mp4')
        seg_narrated(png, mp3, seg, static_45=(x['kind'] == 'question'))
        order.append(seg)
        if x['kind'] == 'question':
            tseg = os.path.join(SEGS, x['id'] + '_timer.mp4')
            seg_timer(png, tseg)
            order.append(tseg)
        print('seg    ' + x['id'], flush=True)

    lst = os.path.join(HERE, 'concat.txt')
    io.open(lst, 'w', encoding='utf-8').write(
        ''.join("file '%s'\n" % s.replace('\\', '/') for s in order))
    out = os.path.join(HERE, a.out)
    run([FFMPEG, '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
         '-c', 'copy', out])
    print('DONE:', out, '(%.1f min)' % (dur(out) / 60))


if __name__ == '__main__':
    main()
