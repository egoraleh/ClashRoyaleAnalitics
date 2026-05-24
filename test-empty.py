import urllib.request, json

# Test with empty available cards
body = json.dumps({'playerTag':'#T','constraints':{'strategy':'Cycle'},'availableCards':[]}).encode()
req = urllib.request.Request('http://localhost:8000/generate-deck', data=body, headers={'Content-Type':'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=5)
    data = json.loads(resp.read())
    print('AI returned cardIds:', data['cardIds'])
    print('len:', len(data['cardIds']))
except Exception as e:
    print('Error:', e)
