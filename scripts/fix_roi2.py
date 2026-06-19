import sys
sys.stdout.reconfigure(encoding="utf-8")

src = r"C:\Users\beatw\Desktop\malta-luxury-estates\src\components\ROICalculator.tsx"
with open(src, "rb") as fp:
    raw = fp.read()

# The garbled euro is: c3 a2 e2 80 9a c2 ac
# which is UTF-8 of: â + ‚ + ¬ = cp1252 misread of €
garbled = b'\xc3\xa2\xe2\x80\x9a\xc2\xac'
proper = '€'.encode('utf-8')  # € in UTF-8 = e2 82 ac

count = raw.count(garbled)
print(f"Found {count} garbled euro occurrences, bytes: {garbled.hex()}")
print(f"Replacing with: {proper.hex()}")

raw = raw.replace(garbled, proper)

with open(src, "wb") as fp:
    fp.write(raw)
print("Fixed and saved")

# Verify
with open(src, encoding="utf-8-sig") as fp:
    c = fp.read()
import re
found = re.findall(r'.{5}€.{5}', c)
print("Verified euro contexts:", found[:5])