import { TradingChart } from './components/TradingChart'
import './App.css'

function App() {
  return (
    <div className="App">
      <TradingChart symbol="BTCUSDT" initialTimeframe="1h" />
    </div>
  )
}

export default App
