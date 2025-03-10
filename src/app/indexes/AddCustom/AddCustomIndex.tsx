import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {AddCustomIndexAssets} from "@/app/indexes/AddCustom/AddCustomIndexAssets";
import {Asset} from "@/utils/types/general.types";

export function AddCustomIndex({assets}: {assets: Asset[]}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Index</Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Index</DialogTitle>
                    <DialogDescription>Create your custom Index</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" placeholder="Index Name..." className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assets" className="text-right">
                            Assets
                        </Label>
                        <AddCustomIndexAssets assets={assets} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Add Index</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
