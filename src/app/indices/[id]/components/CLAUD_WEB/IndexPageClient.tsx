"use client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {IndexOverview} from "@/app/indices/[id]/components/CLAUD_WEB/IndexOverview";
import {IndexChart} from "@/app/indices/[id]/components/CLAUD_WEB/IndexChart";
import {AssetsTable} from "@/app/indices/[id]/components/CLAUD_WEB/AssetsTable";
import {ModalIndexData, IndexModal} from "@/app/indices/components/CLAUD_WEB/IndexModal";
import {Index, AssetWithHistoryOverviewPortionAndMaxDrawDown, Asset} from "@/utils/types/general.types";
import {useSession} from "next-auth/react";
import {useState} from "react";
import {PAGES_URLS} from "@/utils/constants/general.constants";

export function IndexPageClient({index}: {index: Index<AssetWithHistoryOverviewPortionAndMaxDrawDown> | null}) {
    const router = useRouter();
    const session = useSession();
    const currentUserId = session.data?.user?.id;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock available assets - replace with actual data fetch
    const [availableAssets] = useState<Asset[]>([
        // You'll need to fetch this data from your API
        // For now, using placeholder data
    ]);

    const handleEdit = () => {
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        // TODO: Implement delete functionality
        console.log("Delete index:", index?.id);
        router.push(PAGES_URLS.indices);
    };

    const handleClone = () => {
        // TODO: Implement clone functionality
        console.log("Clone index:", index?.id);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalSave = async (indexData: ModalIndexData) => {
        try {
            // TODO: Implement the API call to update the index
            console.log("Updating index:", index?.id, "with data:", indexData);

            // Example API call structure:
            // const response = await fetch(`/api/indexes/${index?.id}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(indexData)
            // });

            // if (response.ok) {
            //     // Refresh the page data or update local state
            //     router.refresh();
            // }

            setIsModalOpen(false);
        } catch (error) {
            console.error("Error updating index:", error);
        }
    };

    if (!index) {
        return (
            <>
                <div className="flex min-h-screen bg-gray-50">
                    <main className="flex-1 p-8">
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Index not found</h1>
                            <p className="text-gray-600 mb-8">The index you're looking for doesn't exist.</p>
                            <Button onClick={() => router.push(PAGES_URLS.indices)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Indices
                            </Button>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <main className="flex-1 p-8">
                    {/* Back Navigation */}
                    <div className="mb-6">
                        <Button variant="outline" onClick={() => router.push(PAGES_URLS.indices)} className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Indices
                        </Button>
                    </div>

                    {/* Index Overview */}
                    <IndexOverview
                        index={index}
                        currentUserId={currentUserId}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onClone={handleClone}
                    />

                    {/* Chart */}
                    <IndexChart index={index} />

                    {/* Assets Table */}
                    <AssetsTable assets={index.assets} />
                </main>
            </div>

            {/* Update Index Modal */}
            <IndexModal
                isOpen={isModalOpen}
                onCloseAction={handleModalClose}
                onSaveAction={handleModalSave}
                availableAssets={availableAssets}
                indexOverview={index}
            />
        </>
    );
}
