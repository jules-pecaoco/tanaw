import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHazardReports, uploadHazardReport } from "@/services/supabase";

const useHazardReports = () => {
  const queryClient = useQueryClient();

  // Fetch reports
  const {
    data: reports,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hazardReports"],
    queryFn: fetchHazardReports,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Create a new report
  const mutation = useMutation({
    mutationFn: ({ hazardData, imageUri }) => uploadHazardReport(hazardData, imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hazardReports"] });
    },
  });

  // Filter reports by type
  const filterReportsByType = (type) => {
    if (!reports) return [];
    return reports.filter((report) => report.hazard_type === type);
  };

  // Get heatmap data
  const getHeatmapData = () => {
    if (!reports) return [];
    return reports.map((report) => ({
      latitude: report.latitude,
      longitude: report.longitude,
      weight: 1,
    }));
  };

  return {
    reports,
    isLoading,
    error,
    refetch,
    createReport: mutation.mutate,
    isCreating: mutation.isLoading,
    creationError: mutation.error,
    filterReportsByType,
    getHeatmapData,
  };
};

export default useHazardReports;
