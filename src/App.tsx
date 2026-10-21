import CarList from "@/components/CarList";
import { searchResponse } from "@/data/searchResponse";
import "./App.css";

function App() {
  return (
    <main className="app">
      <h1 className="ts-headline-s-heavy">Car hire</h1>
      <h2 className="ts-subtitle-m-heavy">Available cars</h2>
      <CarList
        cars={searchResponse.cars}
        vendors={searchResponse.vendors}
        locations={searchResponse.locations}
        label="Available cars"
      />
    </main>
  );
}

export default App;
