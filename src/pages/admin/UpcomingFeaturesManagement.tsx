
import React, { useEffect, useState } from 'react';
import {
    getUpcomingFeatures,
    addUpcomingFeature,
    updateUpcomingFeature,
    deleteUpcomingFeature,
    type UpcomingFeature
} from '@/lib/db';
import { Loader2, Plus, Pencil, Trash2, Save, X, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export const UpcomingFeaturesManagement = () => {
    const [features, setFeatures] = useState<UpcomingFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState<Partial<UpcomingFeature>>({});
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const data = await getUpcomingFeatures();
            setFeatures(data);
        } catch (error) {
            console.error("Failed to fetch features", error);
            toast({
                title: "Error",
                description: "Failed to fetch upcoming features.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const handleSave = async () => {
        // Validation Logic
        if (!currentFeature.title || currentFeature.title.length < 3) {
            toast({
                title: "Validation Error",
                description: "Title must be at least 3 characters long.",
                variant: "destructive",
            });
            return;
        }

        if (!currentFeature.description || currentFeature.description.length < 10) {
            toast({
                title: "Validation Error",
                description: "Description must be at least 10 characters long to provide enough detail.",
                variant: "destructive",
            });
            return;
        }

        if (!currentFeature.status) {
            toast({
                title: "Validation Error",
                description: "Please select a status for this feature.",
                variant: "destructive",
            });
            return;
        }

        // Basic URL validation if image is provided
        if (currentFeature.image && currentFeature.image.trim() !== "") {
            try {
                new URL(currentFeature.image);
            } catch (_) {
                toast({
                    title: "Validation Error",
                    description: "Please enter a valid URL for the image.",
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            if (isEditing && currentFeature.id) {
                await updateUpcomingFeature(currentFeature.id, currentFeature);
                toast({
                    title: "Success",
                    description: "Feature updated successfully.",
                });
            } else {
                await addUpcomingFeature(currentFeature as any);
                toast({
                    title: "Success",
                    description: "New feature added successfully.",
                });
            }
            setIsDialogOpen(false);
            setCurrentFeature({});
            setIsEditing(false);
            fetchFeatures();
        } catch (error) {
            console.error("Failed to save feature", error);
            toast({
                title: "Error",
                description: "Failed to save feature.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this feature?")) return;

        try {
            await deleteUpcomingFeature(id);
            toast({
                title: "Success",
                description: "Feature deleted successfully.",
            });
            fetchFeatures();
        } catch (error) {
            console.error("Failed to delete feature", error);
            toast({
                title: "Error",
                description: "Failed to delete feature.",
                variant: "destructive",
            });
        }
    };

    const openAddDialog = () => {
        setCurrentFeature({ status: 'Planned' });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const openEditDialog = (feature: UpcomingFeature) => {
        setCurrentFeature({ ...feature });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Rocket className="h-6 w-6 text-primary" />
                    <h1 className="text-3xl font-bold">Upcoming Features Management</h1>
                </div>
                <Button onClick={openAddDialog}>
                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : features.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    No features found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            features.map((feature) => (
                                <TableRow key={feature.id}>
                                    <TableCell className="font-medium">
                                        <div>{feature.title}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">{feature.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${feature.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            feature.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                            {feature.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {feature.createdAt && !isNaN(new Date(feature.createdAt).getTime()) ?
                                            format(new Date(feature.createdAt), 'MMM d, yyyy') :
                                            '-'
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(feature)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(feature.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Feature' : 'Add New Feature'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update the details of the upcoming feature.' : 'Add a new feature to the upcoming list.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 overflow-y-auto px-1">
                        <div className="grid gap-2">
                            <label htmlFor="title" className="text-sm font-medium">Title</label>
                            <Input
                                id="title"
                                value={currentFeature.title || ''}
                                onChange={(e) => setCurrentFeature({ ...currentFeature, title: e.target.value })}
                                placeholder="e.g., Dark Mode 2.0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="status" className="text-sm font-medium">Status</label>
                            <Select
                                value={currentFeature.status}
                                onValueChange={(value) => setCurrentFeature({ ...currentFeature, status: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Planned">Planned</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-medium">Description</label>
                            <Textarea
                                id="description"
                                value={currentFeature.description || ''}
                                onChange={(e) => setCurrentFeature({ ...currentFeature, description: e.target.value })}
                                placeholder="Describe the feature..."
                                rows={4}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="image" className="text-sm font-medium">Image URL (Optional)</label>
                            <Input
                                id="image"
                                value={currentFeature.image || ''}
                                onChange={(e) => setCurrentFeature({ ...currentFeature, image: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
