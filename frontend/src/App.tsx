import { TradingChart } from './components/TradingChart'
import './App.css'

function App() {
  return (
    <div className="App">
      <TradingChart initialCoinId="bitcoin" initialTimeframe="1h" />
    </div>
  )
}

export default App
