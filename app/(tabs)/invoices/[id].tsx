import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useMyInvoiceDetail, useExportInvoicePDF } from '../../../hooks/useInvoices';
import { formatDate } from '../../../utils/date';
import { ApiError } from '../../../lib/api';
import { useToast } from '../../../providers/ToastProvider';

// Components
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Notice } from '../../../components/ui/Notice';
import { Button } from '../../../components/ui/Button';
import { InvoiceStatusBadge } from '../../../components/ui/InvoiceStatusBadge';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { showToast } = useToast();
  
  // Handle id parameter
  const invoiceId = typeof id === 'string' ? parseInt(id, 10) : null;

  const detailQuery = useMyInvoiceDetail(invoiceId || 0);
  const exportPDFMutation = useExportInvoicePDF();

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('vi-VN') + 'đ';
  };

  const handleExportPDF = async () => {
    try {
      if (!invoiceId) {
        console.log('PDF Export: No invoiceId');
        return;
      }
      
      console.log('PDF Export: Starting export for invoiceId:', invoiceId);
      
      // Download PDF using API client (with auth token)
      console.log('PDF Export: Calling exportPDFMutation...');
      const arrayBuffer = await exportPDFMutation.mutateAsync(invoiceId);
      console.log('PDF Export: Received arrayBuffer, size:', arrayBuffer.byteLength);
      
      // Convert ArrayBuffer to base64
      console.log('PDF Export: Converting to base64...');
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
      const base64String = btoa(binaryString);
      console.log('PDF Export: Base64 conversion done, length:', base64String.length);
      
      // Create file URI
      const fileName = `invoice_${invoiceId}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      console.log('PDF Export: File URI:', fileUri);
      
      // Write PDF to local storage
      console.log('PDF Export: Writing to file system...');
      await FileSystem.writeAsStringAsync(fileUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('PDF Export: File written successfully');
      
      // Just show success message - no browser navigation
      console.log('PDF Export: File saved successfully');
      
      // Show success toast
      showToast('PDF hóa đơn đã được xuất thành công!', 'success');
      
      // Optional: Show alert with share option
      Alert.alert(
        'Xuất PDF thành công',
        `Tệp "${fileName}" đã được lưu.\n\nBạn muốn chia sẻ tệp này không?`,
        [
          { text: 'Không', style: 'cancel' },
          {
            text: 'Chia sẻ',
            onPress: async () => {
              try {
                const canShare = await Sharing.isAvailableAsync();
                if (canShare) {
                  await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Chia sẻ PDF hóa đơn',
                  });
                } else {
                  showToast('Tính năng chia sẻ không khả dụng', 'warning');
                }
              } catch (shareError) {
                console.error('Share error:', shareError);
                showToast('Không thể chia sẻ tệp', 'error');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Export PDF error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Không thể xuất PDF hóa đơn. Vui lòng thử lại.';
      
      if (error && typeof error === 'object') {
        if ('statusCode' in error) {
          const apiError = error as any;
          if (apiError.statusCode === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            showToast('Phiên đăng nhập hết hạn', 'error');
          } else {
            errorMessage = `Lỗi ${apiError.statusCode}: ${apiError.message || 'Unknown error'}`;
          }
        } else if ('message' in error) {
          errorMessage = (error as Error).message;
        }
      }
      
      Alert.alert('Lỗi', errorMessage);
    }
  };

  // Handle missing or invalid ID
  if (!id || !invoiceId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Notice
            type="error"
            title="Thiếu tham số"
            message="Không xác định mã hóa đơn"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (detailQuery.isLoading) {
    return <LoadingSpinner message="Đang tải chi tiết hóa đơn..." />;
  }

  if (detailQuery.error) {
    const apiError = detailQuery.error as unknown as ApiError;
    
    if (apiError.statusCode === 404) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View style={{ flex: 1, padding: 20 }}>
            <Notice
              type="error"
              title="Không tìm thấy"
              message="Hóa đơn không tồn tại hoặc không thuộc sở hữu của bạn."
            />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <ErrorMessage
        title="Không thể tải chi tiết hóa đơn"
        message={apiError.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
        onRetry={() => detailQuery.refetch()}
      />
    );
  }

  const { invoice, patient, doctor, prescriptions } = detailQuery.data || {};

  if (!invoice) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1, padding: 20 }}>
          <Notice
            type="error"
            title="Dữ liệu không hợp lệ"
            message="Không thể hiển thị thông tin hóa đơn."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Invoice Information */}
        <View style={{
          backgroundColor: '#f8fafc',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', flex: 1 }}>
              Hóa đơn #{invoice.id}
            </Text>
            <InvoiceStatusBadge status={invoice.status} />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Tổng tiền</Text>
            <Text style={{ fontSize: 24, color: '#059669', fontWeight: 'bold' }}>
              {formatCurrency(invoice.totalFee)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Tiền khám</Text>
              <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500' }}>
                {formatCurrency(invoice.examinationFee)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Tiền thuốc</Text>
              <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500' }}>
                {formatCurrency(invoice.medicineFee)}
              </Text>
            </View>
          </View>

          {invoice.paymentDate && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Ngày thanh toán</Text>
              <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500' }}>
                {formatDate(invoice.paymentDate)}
              </Text>
            </View>
          )}

          {invoice.paymentMethod && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Phương thức thanh toán</Text>
              <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500' }}>
                {invoice.paymentMethod === 'cash' ? 'Tiền mặt' : 
                 invoice.paymentMethod === 'card' ? 'Thẻ' : 
                 invoice.paymentMethod === 'transfer' ? 'Chuyển khoản' : 
                 invoice.paymentMethod}
              </Text>
            </View>
          )}

          {invoice.notes && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Ghi chú</Text>
              <Text style={{ fontSize: 16, color: '#111827', lineHeight: 22 }}>
                {invoice.notes}
              </Text>
            </View>
          )}
        </View>

        {/* Patient & Doctor Information */}
        {(patient || doctor) && (
          <View style={{
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
              Thông tin khám bệnh
            </Text>

            {patient && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Bệnh nhân
                </Text>
                <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 }}>
                  <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500', marginBottom: 4 }}>
                    {patient.fullName}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280' }}>
                    {patient.gender} • {patient.birthYear} • {patient.phone}
                  </Text>
                  {patient.address && (
                    <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                      {patient.address}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {doctor && (
              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Bác sĩ khám
                </Text>
                <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 }}>
                  <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500' }}>
                    {doctor.fullName}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Prescriptions Section */}
        <View style={{
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
            Đơn thuốc ({prescriptions?.length || 0} loại)
          </Text>

          {!prescriptions || prescriptions.length === 0 ? (
            <View style={{
              padding: 20,
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: 8,
            }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>💊</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
                Không có đơn thuốc cho hóa đơn này
              </Text>
            </View>
          ) : (
            prescriptions.map((prescription, index) => (
              <View
                key={prescription.id}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: index < prescriptions.length - 1 ? 12 : 0,
                }}
              >
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    Thuốc #{prescription.medicineId}
                  </Text>
                </View>

                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 2 }}>Số lượng</Text>
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500' }}>
                    {prescription.quantity} viên/gói
                  </Text>
                </View>

                {prescription.notes && (
                  <View>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 2 }}>Ghi chú</Text>
                    <Text style={{ fontSize: 14, color: '#111827', lineHeight: 18 }}>
                      {prescription.notes}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <Button
            title="Xuất PDF hóa đơn"
            onPress={handleExportPDF}
            loading={exportPDFMutation.isPending}
            disabled={exportPDFMutation.isPending}
            style={{ marginBottom: 8 }}
          />
        </View>

        {/* Additional Info */}
        <View style={{ marginTop: 20, padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#0369a1', textAlign: 'center' }}>
            ID hóa đơn: {invoice.id} • Bệnh án: {invoice.medicalRecordId}
          </Text>
          <Text style={{ fontSize: 12, color: '#0369a1', textAlign: 'center', marginTop: 4 }}>
            Tạo lúc: {formatDate(invoice.createdAt)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



