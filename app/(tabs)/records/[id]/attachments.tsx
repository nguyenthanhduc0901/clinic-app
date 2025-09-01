import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useMyMedicalRecordAttachments, useDownloadAttachment } from '../../../../hooks/useMedicalRecords';
import { formatDate } from '../../../../utils/date';
import { ApiError } from '../../../../lib/api';

// Components
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { Notice } from '../../../../components/ui/Notice';
import { Button } from '../../../../components/ui/Button';

export default function AttachmentsScreen() {
  const { id } = useLocalSearchParams();
  const recordId = typeof id === 'string' ? parseInt(id, 10) : null;
  
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const attachmentsQuery = useMyMedicalRecordAttachments(recordId || 0);
  const downloadMutation = useDownloadAttachment();

  const handleDownload = async (attachmentId: number, fileName: string, fileType?: string) => {
    if (!recordId) return;
    
    try {
      setDownloadingId(attachmentId);
      
      // Download the file using the mutation
      const arrayBuffer = await downloadMutation.mutateAsync({ 
        recordId, 
        attachmentId 
      });
      
      // Convert ArrayBuffer to base64
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
      const base64String = btoa(binaryString);
      
      // Determine file extension
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'file';
      const mimeType = fileType || getMimeType(fileExtension);
      
      // Create file URI
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write file to local storage
      await FileSystem.writeAsStringAsync(fileUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Handle different file types
      if (mimeType.startsWith('image/')) {
        // Preview image
        setPreviewUri(fileUri);
        Alert.alert(
          'Tải xuống thành công',
          `Đã tải file ${fileName}. Bạn có muốn chia sẻ file này?`,
          [
            { text: 'Đóng', style: 'cancel' },
            { text: 'Chia sẻ', onPress: () => shareFile(fileUri) },
          ]
        );
      } else {
        // For non-image files, offer to share or open
        Alert.alert(
          'Tải xuống thành công',
          `Đã tải file ${fileName}. Bạn muốn làm gì?`,
          [
            { text: 'Đóng', style: 'cancel' },
            { text: 'Chia sẻ', onPress: () => shareFile(fileUri) },
            { text: 'Mở', onPress: () => openFile(fileUri) },
          ]
        );
      }
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Lỗi', 'Không thể tải xuống tệp. Vui lòng thử lại.');
    } finally {
      setDownloadingId(null);
    }
  };

  const shareFile = async (fileUri: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Lỗi', 'Tính năng chia sẻ không khả dụng trên thiết bị này.');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ tệp.');
    }
  };

  const openFile = async (fileUri: string) => {
    try {
      const supported = await Linking.canOpenURL(fileUri);
      if (supported) {
        await Linking.openURL(fileUri);
      } else {
        Alert.alert('Lỗi', 'Không thể mở loại tệp này.');
      }
    } catch (error) {
      console.error('Open file error:', error);
      Alert.alert('Lỗi', 'Không thể mở tệp.');
    }
  };

  const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  const getFileIcon = (fileType?: string, fileName?: string) => {
    if (!fileType && !fileName) return '📄';
    
    const type = fileType || getMimeType(fileName?.split('.').pop()?.toLowerCase() || '');
    
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📕';
    if (type.includes('word')) return '📘';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📗';
    return '📄';
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

  if (attachmentsQuery.isLoading) {
    return <LoadingSpinner message="Đang tải danh sách tệp đính kèm..." />;
  }

  if (attachmentsQuery.error) {
    const apiError = attachmentsQuery.error as unknown as ApiError;
    
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
        title="Không thể tải danh sách tệp đính kèm"
        message={apiError.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
        onRetry={() => attachmentsQuery.refetch()}
      />
    );
  }

  const attachments = attachmentsQuery.data?.data || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            Tệp đính kèm ({attachments.length})
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>
            Các tệp liên quan đến bệnh án này
          </Text>
        </View>

        {/* Preview Image */}
        {previewUri && (
          <View style={{
            marginBottom: 20,
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            padding: 16,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827', marginBottom: 12 }}>
              Xem trước
            </Text>
            <Image
              source={{ uri: previewUri }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                backgroundColor: '#f3f4f6',
              }}
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => setPreviewUri(null)}
              style={{
                marginTop: 12,
                alignSelf: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: '#e5e7eb',
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 14, color: '#374151' }}>Đóng xem trước</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {attachments.length === 0 ? (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
          }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📎</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Không có tệp đính kèm
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 }}>
              Bệnh án này chưa có tệp đính kèm nào
            </Text>
          </View>
        ) : (
          /* Attachments List */
          attachments.map((attachment) => (
            <TouchableOpacity
              key={attachment.id}
              activeOpacity={0.7}
              onPress={() => handleDownload(attachment.id, attachment.fileName, attachment.fileType)}
              disabled={downloadingId === attachment.id}
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                opacity: downloadingId === attachment.id ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>
                  {getFileIcon(attachment.fileType, attachment.fileName)}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827', marginBottom: 2 }}>
                    {attachment.fileName}
                  </Text>
                  {attachment.fileType && (
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      {attachment.fileType}
                    </Text>
                  )}
                </View>
              </View>

              {attachment.description && (
                <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 18 }}>
                  {attachment.description}
                </Text>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {formatDate(attachment.createdAt)}
                </Text>
                <Text style={{ fontSize: 12, color: '#0ea5e9', fontWeight: '500' }}>
                  {downloadingId === attachment.id ? 'Đang tải...' : 'Tải xuống'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Loading indicator for downloads */}
        {downloadMutation.isPending && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <LoadingSpinner message="Đang tải xuống..." />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}



