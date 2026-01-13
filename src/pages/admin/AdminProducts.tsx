import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validateFiles, uploadRateLimiter, generateSecureFilename } from '@/lib/fileUpload';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/auditLog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  price: number;
  original_price: number | null;
  images: string[];
  status: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  category: 'T-Shirts',
  size: 'M',
  condition: 'new',
  price: 0,
  original_price: null,
  images: [],
  status: 'available',
};

const categories = [
  // Winter Wear
  'Hoodies',
  'Sweatshirts',
  'Sweaters',
  'Cardigans',
  'Winter Jackets',
  'Coats',
  'Thermals',
  'Scarves',
  'Beanies',
  
  // Summer Wear
  'T-Shirts',
  'Tank Tops',
  'Polo Shirts',
  'Shorts',
  'Summer Dresses',
  'Sleeveless Shirts',
  
  // All Season
  'Jeans',
  'Trousers',
  'Chinos',
  'Casual Pants',
  'Joggers',
  'Track Pants',
  'Shirts',
  'Casual Shirts',
  'Formal Shirts',
  'Denim Jackets',
  'Blazers',
  'Suits',
  'Kurtas',
  'Ethnic Wear',
  
  // Footwear
  'Sneakers',
  'Formal Shoes',
  'Boots',
  'Sandals',
  'Slippers',
  'Sports Shoes',
  
  // Accessories
  'Belts',
  'Watches',
  'Bags',
  'Wallets',
  'Sunglasses',
  'Caps',
  'Socks',
  'Ties',
  'Bow Ties',
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '6', '7', '8', '9', '10', '11', '12', 'One Size'];
const conditions = ['new', 'like-new', 'good', 'fair'];

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Validate product data
      if (!data.name.trim() || data.name.length < 3) {
        throw new Error('Product name must be at least 3 characters');
      }
      if (data.price <= 0 || data.price > 1000000) {
        throw new Error('Invalid price range');
      }
      if (data.images.length === 0) {
        throw new Error('At least one image is required');
      }
      
      const { error } = await supabase.from('products').insert({
        name: data.name.trim(),
        description: data.description?.trim() || null,
        category: data.category,
        size: data.size,
        condition: data.condition,
        price: data.price,
        original_price: data.original_price,
        images: data.images,
        status: data.status,
      });
      if (error) throw error;
      
      // Log admin action
      await logAdminAction('product_created', {
        product_name: data.name,
        price: data.price,
        category: data.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created');
      resetForm();
    },
    onError: (error) => {
      logger.error('Error creating product', error);
      toast.error('Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      // Validate if data includes name or price
      if (data.name && (!data.name.trim() || data.name.length < 3)) {
        throw new Error('Product name must be at least 3 characters');
      }
      if (data.price !== undefined && (data.price <= 0 || data.price > 1000000)) {
        throw new Error('Invalid price range');
      }
      
      // Sanitize strings
      const updateData = { ...data };
      if (updateData.name) updateData.name = updateData.name.trim();
      if (updateData.description) updateData.description = updateData.description.trim();
      
      const { error } = await supabase.from('products').update(updateData).eq('id', id);
      if (error) throw error;
      
      // Log admin action
      await logAdminAction('product_updated', {
        product_id: id,
        updated_fields: Object.keys(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated');
      resetForm();
    },
    onError: (error) => {
      logger.error('Error updating product', error);
      toast.error('Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get product data first to cleanup images
      const { data: product } = await supabase
        .from('products')
        .select('images, name')
        .eq('id', id)
        .single();
      
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      // TODO: Delete images from storage
      // if (product?.images?.length) {
      //   await supabase.storage.from('products').remove(product.images);
      // }
      
      // Log admin action
      await logAdminAction('product_deleted', {
        product_id: id,
        product_name: product?.name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
      setDeleteProductId(null);
    },
    onError: (error) => {
      logger.error('Error deleting product', error);
      toast.error('Failed to delete product');
    },
  });

  const toggleStatus = (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    updateMutation.mutate({ id: productId, data: { status: newStatus } });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (product: typeof products[0]) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      size: product.size,
      condition: product.condition,
      price: product.price,
      original_price: product.original_price,
      images: product.images || [],
      status: product.status,
    });
    setEditingProduct(product.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    // Check rate limit
    if (!uploadRateLimiter.canUpload()) {
      toast.error('Too many uploads. Please wait a minute.');
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Validate all files first
      const { valid, invalid } = await validateFiles(files);
      
      // Show errors for invalid files
      invalid.forEach(({ file, error }) => {
        toast.error(`${file.name}: ${error}`);
      });
      
      if (valid.length === 0) {
        setIsUploading(false);
        return;
      }

      // Upload valid files
      for (const file of valid) {
        const secureFilename = generateSecureFilename(file.name);
        const filePath = `products/${secureFilename}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        uploadRateLimiter.recordUpload();
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Products">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Products">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {cond.charAt(0).toUpperCase() + cond.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        original_price: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isDragging ? 'Drop images here' : 'Drag & drop images or click to upload'}
                      </p>
                    </div>
                  )}
                </div>
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-16 h-16 object-cover border border-border rounded"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <div className="bg-background border border-border overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? 'No products found' : 'No products yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Product
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Category
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Price
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Size
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Status
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-secondary flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-micro">
                              No image
                            </div>
                          )}
                        </div>
                        <span className="text-small">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-small capitalize">{product.category}</td>
                    <td className="p-4 text-small">₹{product.price.toLocaleString()}</td>
                    <td className="p-4 text-small">{product.size}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(product.id, product.status)}
                        disabled={updateMutation.isPending}
                        className={`px-2 py-1 text-micro uppercase tracking-wider transition-colors ${
                          product.status === 'available'
                            ? 'bg-foreground text-background'
                            : 'bg-secondary text-muted-foreground'
                        } disabled:opacity-50`}
                      >
                        {product.status}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDialog(product)}
                          className="p-2 hover:bg-secondary transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProductId(product.id)}
                          className="p-2 hover:bg-secondary transition-colors text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProducts;
