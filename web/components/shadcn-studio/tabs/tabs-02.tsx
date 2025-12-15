import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabItem = {
  label: string;
  value: string;
  content: React.ReactNode;
};

const defaultTabs: TabItem[] = [
  {
    label: "Explore",
    value: "explore",
    content: (
      <>
        Discover <span className="text-foreground font-semibold">fresh ideas</span>, trending topics, and hidden gems
        curated just for you. Start exploring and let your curiosity lead the way!
      </>
    ),
  },
  {
    label: "Favorites",
    value: "favorites",
    content: (
      <>
        All your <span className="text-foreground font-semibold">favorites</span> are saved here. Revisit articles,
        collections, and moments you love, any time you want a little inspiration.
      </>
    ),
  },
  {
    label: "Surprise Me",
    value: "surprise",
    content: (
      <>
        <span className="text-foreground font-semibold">Surprise!</span> Here&apos;s something unexpected—a fun fact, a
        quirky tip, or a daily challenge. Come back for a new surprise every day!
      </>
    ),
  },
];

interface TabsOutlinedDemoProps {
  tabs?: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const TabsOutlinedDemo = ({
  tabs = defaultTabs,
  value,
  defaultValue,
  onChange,
  className,
}: TabsOutlinedDemoProps) => {
  const firstValue = tabs[0]?.value;
  const resolvedDefault = defaultValue ?? firstValue;
  const isControlled = value !== undefined;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <Tabs
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : resolvedDefault}
        onValueChange={onChange}
        className="gap-4"
      >
        <TabsList className="bg-background gap-1 border p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="w-full space-y-4">{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TabsOutlinedDemo;
