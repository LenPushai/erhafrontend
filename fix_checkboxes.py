# Fix Actions Required checkboxes
with open('src/pages/rfq/RFQEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix id attribute
content = content.replace('id=`edit-action-${opt.value}`}', 'id={`edit-action-${opt.value}`}')

# Fix htmlFor attribute
content = content.replace('htmlFor=`edit-action-${opt.value}`}>', 'htmlFor={`edit-action-${opt.value}`}>')

# Write back
with open('src/pages/rfq/RFQEdit.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ FIXED!')