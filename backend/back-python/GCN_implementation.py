import json
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv


# Load JSON data

with open("enriched_graph.json", encoding="utf-8") as f:
    enriched_data = json.load(f)

with open("graph_data.json", encoding="utf-8") as f:
    graph_data = json.load(f)

with open("students_profiles.json", encoding="utf-8") as f:
    students_data = json.load(f)

with open("forward_recommendation_paths.json", encoding="utf-8") as f:
    forward_paths = json.load(f)


# Testing with one student 

student = students_data[0]
student_id = student["student_id"]
sous_aqcuis = set(student.get("sous_acquis", []))

print(f"Training for student {student_id}, sous_acquis={sous_aqcuis}")

# Prepare node list & mapping

lesson_labels = list(enriched_data.keys())
label_to_idx = {label: idx for idx, label in enumerate(lesson_labels)}


# Normalize node features

max_in = max(feats["in_degree"] for feats in enriched_data.values()) or 1
max_out = max(feats["out_degree"] for feats in enriched_data.values()) or 1
max_struggle = max(feats["struggling_students"] for feats in enriched_data.values()) or 1

node_features = []
for lesson in lesson_labels:
    feats = enriched_data[lesson]
    bloom_norm = feats["bloom_norm"]
    in_deg_norm = feats["in_degree"] / max_in
    out_deg_norm = feats["out_degree"] / max_out
    struggle_norm = feats["struggling_students"] / max_struggle
    mastery_flag = 1.0 if lesson in sous_aqcuis else 0.0  # student-dependent
    node_features.append([
        bloom_norm,
        in_deg_norm,
        out_deg_norm,
        struggle_norm,
        mastery_flag
    ])

x = torch.tensor(node_features, dtype=torch.float)


# Build edge index

edges = graph_data["links"]
edge_list = []
for link in edges:
    s, t = int(link["source"]), int(link["target"])
    edge_list.append([s, t])
    edge_list.append([t, s])  # undirected

edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
data = Data(x=x, edge_index=edge_index)


# Define simple GCN model

class LessonGCN(torch.nn.Module):
    def __init__(self, in_dim=5, hidden_dim=16, out_dim=1):
        super().__init__()
        self.conv1 = GCNConv(in_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, out_dim)

    def forward(self, data):
        x = self.conv1(data.x, data.edge_index)
        x = F.relu(x)
        x = self.conv2(x, data.edge_index)
        return x.view(-1)

model = LessonGCN()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

# Build training target

y = torch.tensor([1.0 if lesson in sous_aqcuis else 0.0 for lesson in lesson_labels])


# Train loop

for epoch in range(200):
    optimizer.zero_grad()
    out = model(data)
    loss = F.mse_loss(out, y)
    loss.backward()
    optimizer.step()
    if epoch % 20 == 0:
        print(f"Epoch {epoch}, loss = {loss.item():.4f}")


# Predictions

model.eval()
with torch.no_grad():
    scores = model(data)

print("\nRaw predictions for all lessons:")
for lesson, score in zip(lesson_labels, scores):
    print(f"{lesson} ({enriched_data[lesson]['name']}): {score.item():.3f} -> {'NEEDS' if lesson in sous_aqcuis else 'OK'}")


# Recommendation filtering

def prerequisites_mastered(lesson):
    prereqs = forward_paths.get(lesson, {}).get("immediate_dependencies", [])
    return all(p not in sous_aqcuis for p in prereqs)

eligible_lessons = [
    (lesson, scores[label_to_idx[lesson]].item())
    for lesson in sous_aqcuis
    if prerequisites_mastered(lesson)
]

eligible_lessons.sort(key=lambda x: x[1], reverse=True)

print(f"\nStudent ID: {student_id}")
if not eligible_lessons:
    print("No lessons eligible for recommendation.")
else:
    print("Recommended lessons:")
    for lesson, score in eligible_lessons:
        prereqs = forward_paths.get(lesson, {}).get("immediate_dependencies", [])
        print(f"  {lesson} ({enriched_data[lesson]['name']}) (priority={score:.3f}) - prereqs: {', '.join(prereqs) if prereqs else 'None'}")
