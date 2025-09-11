import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PDFViewer } from "@/components/pdf-viewer";
import { InvoiceForm } from "@/components/invoice-form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import type { Invoice, InsertInvoice } from "@shared/schema";

export default function Dashboard() {
  const [currentFileId, setCurrentFileId] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Check for invoiceId in URL parameters and load the invoice
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('invoiceId');
    
    if (invoiceId && invoiceId !== currentInvoiceId) {
      setCurrentInvoiceId(invoiceId);
      setExtractedData(null); // Clear extracted data when loading existing invoice
    }
  }, [location, currentInvoiceId]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: api.uploadFile,
    onSuccess: (data) => {
      setCurrentFileId(data.fileId);
      setCurrentFileName(data.fileName);
      setExtractedData(null); // Clear extracted data on new upload
      setCurrentInvoiceId(''); // Clear current invoice
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Extract mutation
  const extractMutation = useMutation({
    mutationFn: ({ fileId, model }: { fileId: string; model: string }) =>
      api.extractInvoiceData(fileId, model),
    onSuccess: (data) => {
      setExtractedData(data);
      toast({
        title: "Success",
        description: "Invoice data extracted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Extraction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: async (data: InsertInvoice | { id: string; data: Partial<Invoice> }) => {
      if ('id' in data) {
        return api.updateInvoice(data.id, data.data);
      } else {
        return api.createInvoice(data);
      }
    },
    onSuccess: (invoice) => {
      setCurrentInvoiceId(invoice.id);
      setExtractedData(null); // Clear extracted data after save
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', invoice.id] }); // Invalidate detail cache
      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: api.deleteInvoice,
    onSuccess: () => {
      setCurrentInvoiceId('');
      setCurrentFileId('');
      setCurrentFileName('');
      setExtractedData(null); // Clear extracted data on delete
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get current invoice data if available
  const { data: currentInvoice } = useQuery({
    queryKey: ['/api/invoices', currentInvoiceId],
    queryFn: () => api.getInvoice(currentInvoiceId),
    enabled: !!currentInvoiceId,
  });

  const handleUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleExtract = (fileId: string, model: string) => {
    extractMutation.mutate({ fileId, model });
  };

  const handleSave = (data: InsertInvoice | { id: string; data: Partial<Invoice> }) => {
    saveInvoiceMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    deleteInvoiceMutation.mutate(id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">PDF Review Dashboard</h2>
          <p className="text-sm text-muted-foreground">Upload, extract, and manage invoice data</p>
        </div>
      </header>

      {/* Split Content */}
      <div className="flex-1 flex overflow-hidden">
        <PDFViewer
          fileId={currentFileId}
          fileName={currentFileName}
          onUpload={handleUpload}
          isUploading={uploadMutation.isPending}
        />
        <InvoiceForm
          fileId={currentFileId}
          fileName={currentFileName}
          invoiceData={currentInvoice}
          extractedData={extractedData}
          onExtract={handleExtract}
          onSave={handleSave}
          onDelete={handleDelete}
          isExtracting={extractMutation.isPending}
          isSaving={saveInvoiceMutation.isPending}
        />
      </div>
    </div>
  );
}
