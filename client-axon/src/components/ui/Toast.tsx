import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";
import { nanoid } from "@reduxjs/toolkit";
import {
  VscCheck,
  VscClose,
  VscError,
  VscInfo,
  VscLoading,
  VscWarning,
} from "react-icons/vsc";

import { Surface } from "./Surface";
import { Subtext } from "./Typography";

export type ToastVariant = "info" | "success" | "warning" | "danger" | "loading";

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  variant?: ToastVariant;
  /** ms; set 0 to disable auto-dismiss */
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

type ToastInput = Omit<ToastItem, "id"> & { id?: string };

interface ToastApi {
  push: (toast: ToastInput) => string;
  update: (id: string, patch: Partial<Omit<ToastItem, "id">>) => void;
  dismiss: (id: string) => void;
  clear: () => void;

  info: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  success: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  warning: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  danger: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
  loading: (title: string, message?: string, opts?: Partial<ToastInput>) => string;
}

const ToastContext = createContext<ToastApi | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const slideIn = keyframes`
  from { transform: translateX(14px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
`;

const Viewport = styled.div`
  position: fixed;
  right: 14px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9998; /* keep below your Modal if it uses 9999 */
  pointer-events: none;
`;

const Card = styled(Surface)<{ $v: ToastVariant }>`
  width: 360px;
  max-width: calc(100vw - 28px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.35);
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bg.surface};
  position: relative;
  overflow: hidden;
  animation: ${slideIn} 160ms ease-out;
  pointer-events: auto;

  display: grid;
  grid-template-columns: 18px 1fr auto;
  gap: 10px;
  align-items: start;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ theme, $v }) => {
      const p = theme.colors.palette;
      if ($v === "success") return p.success;
      if ($v === "warning") return p.accent;
      if ($v === "danger") return p.danger;
      if ($v === "loading") return p.primary;
      return p.secondary;
    }};
  }
`;

const IconWrap = styled.div<{ $v: ToastVariant }>`
  margin-top: 2px;
  color: ${({ theme, $v }) => {
    const p = theme.colors.palette;
    if ($v === "success") return p.success;
    if ($v === "warning") return p.accent;
    if ($v === "danger") return p.danger;
    if ($v === "loading") return p.primary;
    return p.secondary;
  }};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Title = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.25;
`;

const Message = styled(Subtext)`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.bg.overlay};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const getIcon = (v: ToastVariant) => {
  if (v === "success") return <VscCheck />;
  if (v === "warning") return <VscWarning />;
  if (v === "danger") return <VscError />;
  if (v === "loading") return <VscLoading className="spin" />;
  return <VscInfo />;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    const t = timers.current[id];
    if (t) window.clearTimeout(t);
    delete timers.current[id];
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => {
    Object.values(timers.current).forEach((t) => window.clearTimeout(t));
    timers.current = {};
    setToasts([]);
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = input.id ?? nanoid();
      const item: ToastItem = {
        id,
        title: input.title,
        message: input.message,
        variant: input.variant ?? "info",
        duration: input.duration ?? (input.variant === "danger" ? 6000 : 3500),
        actionLabel: input.actionLabel,
        onAction: input.onAction,
      };

      setToasts((prev) => [item, ...prev].slice(0, 5));

      if (item.duration && item.duration > 0) {
        timers.current[id] = window.setTimeout(() => dismiss(id), item.duration);
      }

      return id;
    },
    [dismiss]
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<ToastItem, "id">>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );

      // re-arm timer if duration changes
      if (typeof patch.duration === "number") {
        const existing = timers.current[id];
        if (existing) window.clearTimeout(existing);
        delete timers.current[id];

        if (patch.duration > 0) {
          timers.current[id] = window.setTimeout(() => dismiss(id), patch.duration);
        }
      }
    },
    [dismiss]
  );

  // convenience helpers
  const info = useCallback(
    (title: string, message?: string, opts?: Partial<ToastInput>) =>
      push({ ...opts, title, message, variant: "info" }),
    [push]
  );

  const success = useCallback(
    (title: string, message?: string, opts?: Partial<ToastInput>) =>
      push({ ...opts, title, message, variant: "success" }),
    [push]
  );

  const warning = useCallback(
    (title: string, message?: string, opts?: Partial<ToastInput>) =>
      push({ ...opts, title, message, variant: "warning" }),
    [push]
  );

  const danger = useCallback(
    (title: string, message?: string, opts?: Partial<ToastInput>) =>
      push({ ...opts, title, message, variant: "danger" }),
    [push]
  );

  const loading = useCallback(
    (title: string, message?: string, opts?: Partial<ToastInput>) =>
      push({ ...opts, title, message, variant: "loading", duration: 0 }),
    [push]
  );

  useEffect(() => () => clear(), [clear]);

  const api: ToastApi = useMemo(
    () => ({ push, update, dismiss, clear, info, success, warning, danger, loading }),
    [push, update, dismiss, clear, info, success, warning, danger, loading]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <Viewport>
            {toasts.map((t) => (
              <Card key={t.id} $variant="surface" $padding={3} $v={t.variant ?? "info"}>
                <IconWrap $v={t.variant ?? "info"}>{getIcon(t.variant ?? "info")}</IconWrap>

                <Content>
                  <Title>{t.title}</Title>
                  {t.message ? <Message>{t.message}</Message> : null}
                </Content>

                <Actions>
                  {t.actionLabel && t.onAction ? (
                    <ActionButton
                      onClick={() => {
                        t.onAction?.();
                        dismiss(t.id);
                      }}
                    >
                      {t.actionLabel}
                    </ActionButton>
                  ) : null}

                  <CloseButton onClick={() => dismiss(t.id)} aria-label="Dismiss toast">
                    <VscClose />
                  </CloseButton>
                </Actions>
              </Card>
            ))}
          </Viewport>,
          document.body
        )}
    </ToastContext.Provider>
  );
};
