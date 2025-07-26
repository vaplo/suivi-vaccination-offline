body {
  font-family: 'Open Sans', sans-serif;
  background: #f7f9fc;
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  width: 90%;
  max-width: 400px;
}

.icon-circle {
  width: 60px;
  height: 60px;
  background: #2f80ed;
  color: white;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.6rem;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

p {
  font-size: 0.9rem;
  color: #555;
}

.buttons {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  padding: 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  display: block;
}

.btn-outline {
  border: 2px solid #2f80ed;
  color: #2f80ed;
  background: white;
}

.btn-outline:hover {
  background: #e3f0ff;
}

.btn-solid {
  background: #27ae60;
  color: white;
}

.btn-solid:hover {
  background: #219150;
}
