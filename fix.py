with open('src/pages/rfq/RFQEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("id=`edit-action-${opt.value}`}", "id={`edit-action-${opt.value}`}")
content = content.replace("htmlFor=`edit-action-${opt.value}`}>", "htmlFor={`edit-action-${opt.value}`}>")

with open('src/pages/rfq/RFQEdit.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('FIXED!')