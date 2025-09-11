import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useLocation } from "wouter";

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invoices with search
  const { data, isLoading } = useQuery({
    queryKey: ['/api/invoices', search],
    queryFn: () => api.getInvoices(search),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteInvoice,
    onSuccess: () => {
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (id: string) => {
    // Navigate to dashboard with the invoice loaded
    setLocation(`/dashboard?invoiceId=${id}`);
  };

  const handleEdit = (id: string) => {
    // Navigate to dashboard with the invoice loaded for editing
    setLocation(`/dashboard?invoiceId=${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount?: number, currency = 'USD') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (invoice: any) => {
    // Simple status logic - in production, this could be based on actual status field
    const hasAllData = invoice.invoice.total && invoice.vendor.name && invoice.invoice.lineItems.length > 0;
    return hasAllData ? 'processed' : 'pending';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Invoice Management</h2>
            <p className="text-sm text-muted-foreground">View and manage all processed invoices</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
              <Input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="search-input"
              />
            </div>
            <Button onClick={() => setLocation('/')} data-testid="new-invoice-btn">
              <i className="fas fa-plus mr-2"></i>
              New Invoice
            </Button>
          </div>
        </div>
      </header>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">Loading invoices...</p>
              </div>
            ) : data?.invoices.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fas fa-file-invoice text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-medium text-foreground mb-2">No invoices found</h3>
                <p className="text-muted-foreground mb-4">
                  {search ? 'No invoices match your search criteria.' : 'Get started by uploading your first PDF invoice.'}
                </p>
                <Button onClick={() => setLocation('/')}>
                  <i className="fas fa-plus mr-2"></i>
                  Create Invoice
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.invoices.map((invoice) => (
                      <TableRow key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                        <TableCell className="font-medium" data-testid={`invoice-number-${invoice.id}`}>
                          {invoice.invoice.number}
                        </TableCell>
                        <TableCell data-testid={`vendor-name-${invoice.id}`}>
                          {invoice.vendor.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`invoice-date-${invoice.id}`}>
                          {formatDate(invoice.invoice.date)}
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`invoice-amount-${invoice.id}`}>
                          {formatCurrency(invoice.invoice.total, invoice.invoice.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(invoice) === 'processed' ? 'default' : 'secondary'}
                            data-testid={`invoice-status-${invoice.id}`}
                          >
                            {getStatusBadge(invoice) === 'processed' ? 'Processed' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(invoice.id)}
                              data-testid={`view-invoice-${invoice.id}`}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(invoice.id)}
                              data-testid={`edit-invoice-${invoice.id}`}
                            >
                              <i className="fas fa-edit text-primary"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(invoice.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`delete-invoice-${invoice.id}`}
                            >
                              <i className="fas fa-trash text-destructive"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{data?.invoices.length || 0}</span> of{' '}
                    <span className="font-medium text-foreground">{data?.total || 0}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
