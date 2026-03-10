import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Doctor, PatientSession } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetDoctor() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  return useQuery<Doctor | null>({
    queryKey: ["doctor", principalStr],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        const doctor = await actor.getDoctor(
          identity.getPrincipal() as unknown as Principal,
        );
        return doctor;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetSessionsByDoctor() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  return useQuery<PatientSession[]>({
    queryKey: ["sessions", principalStr],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        return await actor.getSessionsByDoctor(
          identity.getPrincipal() as unknown as Principal,
        );
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetPatientSession(sessionId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<PatientSession | null>({
    queryKey: ["session", sessionId?.toString()],
    queryFn: async () => {
      if (!actor || sessionId === undefined) return null;
      try {
        return await actor.getPatientSession(sessionId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && sessionId !== undefined,
  });
}

export function useRegisterDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      clinic,
      email,
    }: {
      name: string;
      clinic: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.registerDoctor(name, clinic, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
    },
  });
}

export function useCreatePatientSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      doctorId,
      language,
    }: {
      doctorId: Principal;
      language: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return await actor.createPatientSession(doctorId, language);
    },
  });
}

export function useAnswerQuestion() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      sessionId,
      questionId,
      answer,
    }: {
      sessionId: bigint;
      questionId: bigint;
      answer: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.answerQuestion(sessionId, questionId, answer);
    },
  });
}

export function useCompleteSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      await actor.completeSession(sessionId);
    },
  });
}
