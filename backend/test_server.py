from fastapi.testclient import TestClient
import app.main as m

client = TestClient(m.app)

# Test comparison
options = [
    {'id': '1', 'mode': 'train', 'price': 300, 'duration': 270, 'comfort': 8, 'convenience': 7, 'fuel_cost': 0, 'toll_cost': 0},
    {'id': '2', 'mode': 'flight', 'price': 1800, 'duration': 75, 'comfort': 8, 'convenience': 9, 'fuel_cost': 0, 'toll_cost': 0},
    {'id': '3', 'mode': 'bus', 'price': 350, 'duration': 260, 'comfort': 7, 'convenience': 6, 'fuel_cost': 0, 'toll_cost': 0},
]
resp = client.post('/transport/compare', json={'options': options})
print("Status:", resp.status_code)
result = resp.json()
for k in ['cheapest', 'fastest', 'best_value', 'best_comfort', 'best_convenience']:
    if result[k]:
        print(f"  {k}: {result[k]['mode']} (id={result[k]['id']})")
print("  ranked:", [o['id'] for o in result['ranked']])

# Test health
resp = client.get('/health')
print("Health:", resp.json())

# Test search
resp = client.post('/search/transport', json={
    'origin': 'Chennai', 'destination': 'Madurai',
    'departure_date': '2024-12-20', 'travelers': 2, 'budget': 2000
})
print("Search status:", resp.status_code, "options:", resp.json().get('total_options'))
