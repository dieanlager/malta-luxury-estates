import sys
sys.stdout.reconfigure(encoding="utf-8")

src = r"C:\Users\beatw\Desktop\malta-luxury-estates\app\globals.css"
with open(src, encoding="utf-8") as fp:
    content = fp.read()

old_theme = '''@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Cormorant Garamond", serif;'''

new_theme = '''@theme {
  --font-sans: var(--font-inter, "Inter", ui-sans-serif, system-ui, sans-serif);
  --font-serif: var(--font-cormorant, "Cormorant Garamond", serif);'''

if old_theme in content:
    content = content.replace(old_theme, new_theme, 1)
    print("globals.css theme updated")
else:
    print("Pattern not found, showing current theme block:")
    idx = content.find("@theme")
    print(repr(content[idx:idx+200]))

with open(src, "w", encoding="utf-8") as fp:
    fp.write(content)