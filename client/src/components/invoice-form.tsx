import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ExtractResponse } from "@/lib/api";
import type { Invoice, InsertInvoice } from "@shared/schema";

const invoiceFormSchema = z.object({
  vendor: z.object({
    name: z.string().min(1, "Vendor name is required"),
    address: z.string().optional(),
    taxId: z.string().optional()
  }),
  invoice: z.object({
    number: z.string().min(1, "Invoice number is required"),
    date: z.string().min(1, "Invoice date is required"),
    currency: z.string().optional(),
    subtotal: z.number().optional(),
    taxPercent: z.number().optional(),
    total: z.number().optional(),
    poNumber: z.string().optional(),
    poDate: z.string().optional(),
    lineItems: z.array(z.object({
      description: z.string().min(1, "Description is required"),
      unitPrice: z.number().min(0, "Unit price must be positive"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      total: z.number().min(0, "Total must be positive")
    })).min(1, "At least one line item is required")
  })
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  fileId?: string;
  invoiceData?: Invoice;
  onExtract: (fileId: string, model: string) => void;
  onSave: (data: InsertInvoice | { id: string; data: Partial<Invoice> }) => void;
  onDelete: (id: string) => void;
  isExtracting?: boolean;
  isSaving?: boolean;
}

export function InvoiceForm({ 
  fileId, 
  invoiceData, 
  onExtract, 
  onSave, 
  onDelete, 
  isExtracting, 
  isSaving 
}: InvoiceFormProps) {
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'groq'>('gemini');
  const { toast } = useToast();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      vendor: {
        name: invoiceData?.vendor?.name || "",
        address: invoiceData?.vendor?.address || "",
        taxId: invoiceData?.vendor?.taxId || ""
      },
      invoice: {
        number: invoiceData?.invoice?.number || "",
        date: invoiceData?.invoice?.date || "",
        currency: invoiceData?.invoice?.currency || "USD",
        subtotal: invoiceData?.invoice?.subtotal || 0,
        taxPercent: invoiceData?.invoice?.taxPercent || 0,
        total: invoiceData?.invoice?.total || 0,
        poNumber: invoiceData?.invoice?.poNumber || "",
        poDate: invoiceData?.invoice?.poDate || "",
        lineItems: invoiceData?.invoice?.lineItems || [
          { description: "", unitPrice: 0, quantity: 1, total: 0 }
        ]
      }
    }
  });

  const handleExtract = () => {
    if (!fileId) {
      toast({
        title: "Error",
        description: "Please upload a PDF file first",
        variant: "destructive"
      });
      return;
    }
    onExtract(fileId, selectedModel);
  };

  const handleSave = (data: InvoiceFormData) => {
    if (invoiceData?.id) {
      onSave({
        id: invoiceData.id,
        data: {
          vendor: data.vendor,
          invoice: data.invoice
        }
      });
    } else if (fileId) {
      onSave({
        fileId,
        fileName: "uploaded.pdf", // This should come from the upload response
        vendor: data.vendor,
        invoice: data.invoice
      } as InsertInvoice);
    }
  };

  const handleDelete = () => {
    if (invoiceData?.id && confirm('Are you sure you want to delete this invoice?')) {
      onDelete(invoiceData.id);
    }
  };

  const addLineItem = () => {
    const currentItems = form.getValues().invoice.lineItems;
    form.setValue('invoice.lineItems', [
      ...currentItems,
      { description: "", unitPrice: 0, quantity: 1, total: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues().invoice.lineItems;
    if (currentItems.length > 1) {
      form.setValue('invoice.lineItems', currentItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItemTotal = (index: number) => {
    const lineItems = form.getValues().invoice.lineItems;
    const item = lineItems[index];
    const total = item.unitPrice * item.quantity;
    form.setValue(`invoice.lineItems.${index}.total`, total);
    
    // Update invoice subtotal and total
    const subtotal = lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const taxPercent = form.getValues().invoice.taxPercent || 0;
    const taxAmount = (subtotal * taxPercent) / 100;
    const invoiceTotal = subtotal + taxAmount;
    
    form.setValue('invoice.subtotal', subtotal);
    form.setValue('invoice.total', invoiceTotal);
  };

  // Update the form when extractedData changes
  const populateFormWithExtractedData = (extractedData: ExtractResponse) => {
    form.setValue('vendor', extractedData.vendor);
    form.setValue('invoice', extractedData.invoice);
  };

  return (
    <div className="w-1/2 bg-background overflow-auto">
      <div className="p-6">
        {/* Form Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Invoice Data</h3>
            <p className="text-sm text-muted-foreground">Extract and edit invoice information</p>
          </div>
          <Button 
            onClick={handleExtract}
            disabled={!fileId || isExtracting}
            data-testid="extract-btn"
          >
            {isExtracting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Extracting...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                Extract with AI
              </>
            )}
          </Button>
        </div>

        {/* AI Model Selection */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <label className="block text-sm font-medium text-foreground mb-2">AI Model</label>
          <Select value={selectedModel} onValueChange={(value: 'gemini' | 'groq') => setSelectedModel(value)}>
            <SelectTrigger data-testid="model-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Gemini (Google)</SelectItem>
              <SelectItem value="groq">Groq</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            {/* Vendor Information */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">Vendor Information</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="vendor.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter vendor name" data-testid="vendor-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendor.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter vendor address" 
                          className="h-20 resize-none"
                          data-testid="vendor-address"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendor.taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tax ID" data-testid="vendor-tax-id" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">Invoice Details</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoice.number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Invoice #" data-testid="invoice-number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoice.date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Date</FormLabel>
                        <FormControl>
                          <Input type="date" data-testid="invoice-date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="invoice.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="currency-select">
                              <SelectValue placeholder="USD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoice.taxPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax %</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            data-testid="tax-percent"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoice.total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            className="font-medium" 
                            placeholder="0.00"
                            data-testid="invoice-total"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoice.poNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Purchase order #" data-testid="po-number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoice.poDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Date</FormLabel>
                        <FormControl>
                          <Input type="date" data-testid="po-date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-foreground">Line Items</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={addLineItem}
                  data-testid="add-line-item-btn"
                >
                  <i className="fas fa-plus mr-1"></i>
                  Add Item
                </Button>
              </div>
              <div className="space-y-3" data-testid="line-items">
                {form.watch('invoice.lineItems').map((_, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5">
                          <FormField
                            control={form.control}
                            name={`invoice.lineItems.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Item description" 
                                    data-testid={`line-item-description-${index}`}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`invoice.lineItems.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0"
                                    data-testid={`line-item-quantity-${index}`}
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(parseInt(e.target.value) || 0);
                                      updateLineItemTotal(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`invoice.lineItems.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00"
                                    data-testid={`line-item-unit-price-${index}`}
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value) || 0);
                                      updateLineItemTotal(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`invoice.lineItems.${index}.total`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    readOnly
                                    className="bg-muted"
                                    data-testid={`line-item-total-${index}`}
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            disabled={form.watch('invoice.lineItems').length === 1}
                            data-testid={`remove-line-item-${index}`}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={!invoiceData?.id}
                data-testid="delete-invoice-btn"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button type="submit" disabled={isSaving} data-testid="save-invoice-btn">
                  {isSaving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
