#!/usr/bin/env bash
# يجهّز أدوات صناعة فيديوهات نُزُل في أي جلسة جديدة.
# الاستخدام: bash studio/setup.sh   (من جذر المستودع)
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p /home/claude/scripts /home/claude/fonts /home/claude/footage /home/claude/music \
         /home/claude/build/ov /home/claude/build/scenes /home/claude/build/audio /home/claude/out/music
cp "$HERE"/scripts/* /home/claude/scripts/
cp "$HERE"/fonts/*.ttf /home/claude/fonts/

# اللقطات (Pexels / Pixabay)
while read -r name url; do
  [ -z "$name" ] && continue
  f="/home/claude/footage/$name.mp4"
  [ -s "$f" ] || curl -sSL -o "$f" "$url" &
done < "$HERE/footage_sources.txt"
wait

# الموسيقى والمؤثرات (Pixabay)
while read -r name path; do
  [ -z "$name" ] && continue
  f="/home/claude/music/$name.mp3"
  [ -s "$f" ] || curl -sSL -o "$f" "https://cdn.pixabay.com/audio/$path" &
done < "$HERE/music_sources.txt"
wait

pip install --break-system-packages -q librosa pillow 2>/dev/null || true
python3 -c "from PIL import features; print('raqm:', features.check('raqm'))"
echo "جاهز. الخطوات: python3 /home/claude/scripts/overlays.py && python3 /home/claude/scripts/sync.py && python3 /home/claude/scripts/mix.py && python3 /home/claude/scripts/render.py"
