import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useMyMedicalRecordDetail, useExportMedicalRecordPDF } from '../../../hooks/useMedicalRecords';
import { useMyInvoiceByMedicalRecord } from '../../../hooks/useInvoices';
import { formatDate } from '../../../utils/date';
import { ApiError } from '../../../lib/api';
import api from '../../../lib/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useToast } from '../../../providers/ToastProvider';

// Components
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Notice } from '../../../components/ui/Notice';
import { Button } from '../../../components/ui/Button';
import { MedicalRecordStatusBadge } from '../../../components/ui/MedicalRecordStatusBadge';

export default function MedicalRecordDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showToast } = useToast();
  
  // Handle id parameter
  const recordId = typeof id === 'string' ? parseInt(id, 10) : null;

  const detailQuery = useMyMedicalRecordDetail(recordId || 0);
  const exportPDFMutation = useExportMedicalRecordPDF();
  const invoiceQuery = useMyInvoiceByMedicalRecord(recordId || 0);

  const handleExportPDF = async () => {
    try {
      if (!recordId) {
        console.log('PDF Export: No recordId');
        return;
      }
      
      console.log('PDF Export: Starting export for recordId:', recordId);
      
      // Download PDF using API client (with auth token)
      console.log('PDF Export: Calling exportPDFMutation...');
      const arrayBuffer = await exportPDFMutation.mutateAsync(recordId);
      console.log('PDF Export: Received arrayBuffer, size:', arrayBuffer.byteLength);
      
      // Convert ArrayBuffer to base64
      console.log('PDF Export: Converting to base64...');
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
      const base64String = btoa(binaryString);
      console.log('PDF Export: Base64 conversion done, length:', base64String.length);
      
      // Create file URI
      const fileName = `medical_record_${recordId}.pdf`;
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
      showToast('PDF đã được xuất thành công!', 'success');
      
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
                    dialogTitle: 'Chia sẻ PDF bệnh án',
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
      
      let errorMessage = 'Không thể xuất PDF. Vui lòng thử lại.';
      
      if (error && typeof error === 'object') {
        if ('statusCode' in error) {
          const apiError = error as any;
          if (apiError.statusCode === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            // Could trigger logout here if needed
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

  const handleViewAttachments = () => {
    if (!recordId) return;
    router.push(`/(tabs)/records/${recordId}/attachments`);
  };

  const handleViewInvoice = () => {
    if (!recordId || !invoiceQuery.data?.id) return;
    router.push(`/(tabs)/invoices/${invoiceQuery.data.id}`);
  };

  // Handle missing or invalid ID
  if (!id || !recordId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Notice
            type="error"
            title="Thiếu tham số"
            message="Không xác định mã bệnh án"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (detailQuery.isLoading) {
    return <LoadingSpinner message="Đang tải chi tiết bệnh án..." />;
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
              message="Bệnh án không tồn tại hoặc không thuộc sở hữu của bạn."
            />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <ErrorMessage
        title="Không thể tải chi tiết bệnh án"
        message={apiError.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
        onRetry={() => detailQuery.refetch()}
      />
    );
  }

  const { medicalRecord, prescriptions } = detailQuery.data || {};

  if (!medicalRecord) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1, padding: 20 }}>
          <Notice
            type="error"
            title="Dữ liệu không hợp lệ"
            message="Không thể hiển thị thông tin bệnh án."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Medical Record Information */}
        <View style={{
          backgroundColor: '#f8fafc',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', flex: 1 }}>
              Bệnh án #{medicalRecord.id}
            </Text>
            <MedicalRecordStatusBadge status={medicalRecord.status} />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Ngày khám</Text>
            <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500' }}>
              {formatDate(medicalRecord.examinationDate)}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Chẩn đoán</Text>
            <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500' }}>
              {medicalRecord.diagnosis}
            </Text>
          </View>

          {medicalRecord.symptoms && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Triệu chứng</Text>
              <Text style={{ fontSize: 16, color: '#111827', lineHeight: 22 }}>
                {medicalRecord.symptoms}
              </Text>
            </View>
          )}
        </View>

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
                Không có đơn thuốc cho bệnh án này
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 }}>
                    {prescription.medicineName || `Thuốc #${prescription.medicineId}`}
                  </Text>
                  {prescription.medicinePrice && (
                    <Text style={{ fontSize: 14, color: '#059669', fontWeight: '500' }}>
                      {parseFloat(prescription.medicinePrice).toLocaleString('vi-VN')}đ
                    </Text>
                  )}
                </View>

                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 2 }}>Số lượng</Text>
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500' }}>
                    {prescription.quantity} {prescription.quantity > 1 ? 'viên/gói' : 'viên/gói'}
                  </Text>
                </View>

                {prescription.usageInstruction && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 2 }}>Hướng dẫn sử dụng</Text>
                    <Text style={{ fontSize: 14, color: '#111827', lineHeight: 18 }}>
                      {prescription.usageInstruction}
                    </Text>
                  </View>
                )}

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
            title="Xem tệp đính kèm"
            variant="outline"
            onPress={handleViewAttachments}
            style={{ marginBottom: 8 }}
          />
          
          {/* Invoice Button */}
          {!invoiceQuery.isLoading && invoiceQuery.data && (
            <Button
              title="Xem hóa đơn"
              variant="outline"
              onPress={handleViewInvoice}
              style={{ marginBottom: 8 }}
            />
          )}
          
          {!invoiceQuery.isLoading && invoiceQuery.error && !invoiceQuery.data && (
            <View style={{ 
              marginBottom: 8, 
              padding: 12, 
              backgroundColor: '#fef3c7', 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#fbbf24'
            }}>
              <Text style={{ fontSize: 14, color: '#b45309', textAlign: 'center' }}>
                Chưa có hóa đơn cho bệnh án này
              </Text>
            </View>
          )}
          
          <Button
            title="Xuất PDF"
            onPress={handleExportPDF}
            loading={exportPDFMutation.isPending}
            disabled={exportPDFMutation.isPending}
            style={{ marginBottom: 8 }}
          />
        </View>

        {/* Additional Info */}
        <View style={{ marginTop: 20, padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#0369a1', textAlign: 'center' }}>
            ID bệnh án: {medicalRecord.id}
            {medicalRecord.diseaseTypeId && ` • Loại bệnh: ${medicalRecord.diseaseTypeId}`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
