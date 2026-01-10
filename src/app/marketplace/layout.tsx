export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="container grid flex-1 gap-12 py-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
            <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
                <div className="space-y-4">
                    <div className="py-2">
                        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                            Filters
                        </h2>
                        <div className="space-y-1">
                            <div className="flex items-center px-2 py-1">
                                <input type="checkbox" id="direct" className="mr-2" defaultChecked />
                                <label htmlFor="direct" className="text-sm font-medium">Direct Network</label>
                            </div>
                            <div className="flex items-center px-2 py-1">
                                <input type="checkbox" id="extended" className="mr-2" defaultChecked />
                                <label htmlFor="extended" className="text-sm font-medium">Friends of Friends</label>
                            </div>
                        </div>
                    </div>
                    <div className="py-2">
                        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                            Price Range
                        </h2>
                        {/* Simple placeholders for now */}
                        <div className="px-2 text-sm text-muted-foreground">
                            $500 - $1200
                        </div>
                    </div>
                </div>
            </aside>
            <main className="flex w-full flex-col overflow-hidden">{children}</main>
        </div>
    )
}
