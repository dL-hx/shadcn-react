import { SectionCard } from './components/SectionCard'
import { ChartArea } from './components/ChartArea'
import { DataTable } from './components/DataTable'
import data from "./data.json"

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCard />
        <div className="px-4 lg:px-6">
          <ChartArea />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  )
}