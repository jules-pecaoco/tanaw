import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHazardReports, uploadHazardReport } from "@/services/supabase";

const useHazardReports = () => {
  const queryClient = useQueryClient();

  // Fetch reports
  const {
    data: reports,
    reportsIsLoading,
    reportsError,
    refetch,
  } = useQuery({
    queryKey: ["hazardReports"],
    queryFn: fetchHazardReports,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  // Create a new report
  const mutation = useMutation({
    mutationFn: ({ hazardData, imageUri, uniqueIdentifier }) => uploadHazardReport(hazardData, imageUri, uniqueIdentifier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hazardReports"] });
    },
  });

  // Filter reports by type
  const filterReportsByType = (type) => {
    if (!reports) return [];
    return reports.filter((report) => report.hazard_type === type);
  };

  return {
    reports,
    reportsIsLoading,
    reportsError,
    refetch,
    createReport: mutation.mutate,
    isCreating: mutation.isLoading,
    creationError: mutation.error,
    filterReportsByType,
  };
};

export default useHazardReports;
