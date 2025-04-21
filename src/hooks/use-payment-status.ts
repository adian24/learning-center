import { useQuery } from "@tanstack/react-query";

/**
 * A hook to check the payment status of an enrollment
 *
 * @param enrollmentId The ID of the enrollment to check
 * @param enabled Whether the query should be enabled
 * @param refetchInterval How often to refetch the status (in ms)
 */
export function usePaymentStatus(
  enrollmentId: string | null | undefined,
  enabled = true,
  refetchInterval = 30000
) {
  return useQuery({
    queryKey: ["paymentStatus", enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return null;

      const response = await fetch("/api/check-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check payment status");
      }

      return response.json();
    },
    enabled: !!enrollmentId && enabled,
    refetchInterval,
  });
}

/**
 * A hook to get payment details for an enrollment
 *
 * @param enrollmentId The ID of the enrollment
 * @param enabled Whether the query should be enabled
 */
export function usePaymentDetails(
  enrollmentId: string | null | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: ["paymentDetails", enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return null;

      const response = await fetch("/api/payment-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payment details");
      }

      return response.json();
    },
    enabled: !!enrollmentId && enabled,
  });
}
