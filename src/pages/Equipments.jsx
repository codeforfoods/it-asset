import React, { useState, useEffect, useCallback } from 'react';
import EquipmentTreeTable from '../components/EquipmentTreeTable';
import EquipmentModal from '../components/EquipmentModal';
import StatsCards from '../components/StatsCards';
import { fetchEquipments, fetchCompanies, fetchCategories, fetchDeviceTypes, fetchLocations, fetchLicenseStatuses, transformEquipments, deleteEquipment } from '../services/equipmentService';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function EquipmentsPage() {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [data, setData] = useState([]);
  const [lookups, setLookups] = useState({ companies: [], categories: [], deviceTypes: [], locations: [], licenseStatuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rawEquipments, companies, categories, deviceTypes, locations, licenseStatuses] = await Promise.all([
        fetchEquipments(),
        fetchCompanies(),
        fetchCategories(),
        fetchDeviceTypes(),
        fetchLocations(),
        fetchLicenseStatuses(),
      ]);
      setLookups({ companies, categories, deviceTypes, locations, licenseStatuses });
      const transformed = transformEquipments(rawEquipments, categories);
      setData(transformed);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (row) => {
    setEditingEquipment(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thiết bị "${row.model}"?`)) return;
    try {
      await deleteEquipment(row.id);
      await loadData(); // Refresh data
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
  };

  const handleSaveSuccess = () => {
    handleModalClose();
    loadData(); // Refresh data after save
  };

  return (
    <div className="p-6 h-full flex flex-col max-h-screen">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Thiết bị</h1>
          <p className="text-sm text-muted-foreground mt-1">Cơ sở dữ liệu tập trung các thiết bị viễn thông và chu kỳ sống.</p>
        </div>
        {user?.role !== 'Manager' && (
          <button 
            onClick={() => { setEditingEquipment(null); setIsModalOpen(true); }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary focus:outline-none"
          >
            + Thêm Thiết bị mới
          </button>
        )}
      </div>

      <StatsCards data={data} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive font-medium mb-2">Lỗi tải dữ liệu</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button onClick={loadData} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              Thử lại
            </button>
          </div>
        </div>
      ) : (
        <EquipmentTreeTable data={data} onEdit={handleEdit} onDelete={handleDelete} userRole={user?.role} />
      )}
      
      <EquipmentModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        equipment={editingEquipment}
        lookups={lookups}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
