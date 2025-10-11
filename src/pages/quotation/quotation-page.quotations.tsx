import { useEffect, useState } from "react";
import Quotes from "../../components/quotations/quotes/quotations.quotes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { getAllRisks } from "../../features/reducers/adminReducers/riskSlice";
import { AppDispatch, RootState } from "@/features/store";
import { useDispatch, useSelector } from "react-redux";



const QuoteQuotations = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { risks } = useSelector((state: RootState) => state.risks)

  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any)
  }, [dispatch])

  const tabs = [
    { title: "All", content: <Quotes businessId={null} /> },
    ...risks.map((risk) => ({
      title: risk.riskName,
      content: <Quotes businessId={risk.riskID} />,
    })),
  ]

  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)

  // ✅ Whenever risks change, update the default active tab
  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0]?.title)
    }
  }, [tabs, activeTab])
  return (
    <div className="max-w-[1200px] mx-auto mb-10">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-[#111827] m-0">Quotes</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap">
          {tabs.map((tab,index) => (
            <TabsTrigger
              key={tab.title+index}
              value={tab.title}
              className="flex-1 min-w-[100px] hover:bg-neutral-200"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.title} value={tab.title}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default QuoteQuotations;

