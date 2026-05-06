"use client";

import { useEffect, useState } from "react";
import { Modal, ModalButton, FormField, TextInput, SelectInput } from "./Modal";
import type { Stakeholder } from "@/lib/mock";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (s: Stakeholder) => void;
  onDelete?: (name: string) => void;
  existing?: Stakeholder | null;
  /** All current stakeholders so the "Reports to" dropdown can offer options. */
  allStakeholders: Stakeholder[];
};

const ROLES: Stakeholder["role"][] = ["Champion", "Decision Maker", "Influencer", "Detractor", "User"];
const SENTIMENTS: Stakeholder["sentiment"][] = ["supportive", "neutral", "negative"];
const DEPARTMENTS = ["Executive", "Engineering", "Finance", "Operations", "Product", "Sales", "Other"] as const;

export function StakeholderEditor({ open, onClose, onSave, onDelete, existing, allStakeholders }: Props) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<Stakeholder["role"]>("Influencer");
  const [sentiment, setSentiment] = useState<Stakeholder["sentiment"]>("neutral");
  const [reportsTo, setReportsTo] = useState<string>("");
  const [department, setDepartment] = useState<typeof DEPARTMENTS[number]>("Other");

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setTitle(existing.title);
      setRole(existing.role);
      setSentiment(existing.sentiment);
      setReportsTo(existing.reportsTo ?? "");
      setDepartment((existing.department as typeof DEPARTMENTS[number]) ?? "Other");
    } else {
      setName(""); setTitle(""); setRole("Influencer");
      setSentiment("neutral"); setReportsTo(""); setDepartment("Other");
    }
  }, [existing, open]);

  const submit = () => {
    if (!name.trim() || !title.trim()) return;
    onSave({
      name: name.trim(), title: title.trim(), role, sentiment,
      lastTouch: existing?.lastTouch ?? "today",
      daysSilent: existing?.daysSilent ?? 0,
      reportsTo: reportsTo || undefined,
      department,
    });
  };

  // Reports-to options: anyone except the person being edited (no self-reference)
  const managerOptions = [{ value: "", label: "— No manager (top of tree)" }]
    .concat(allStakeholders
      .filter((s) => s.name !== existing?.name)
      .map((s) => ({ value: s.name, label: `${s.name} · ${s.title}` })));

  return (
    <Modal
      open={open} onClose={onClose}
      title={existing ? `Edit ${existing.name}` : "Add stakeholder"}
      description="Maintain the buying-committee map. Sentiment and reporting line drive the org chart."
      width={560}
      footer={
        <>
          {existing && onDelete && (
            <ModalButton danger onClick={() => { onDelete(existing.name); onClose(); }}>Remove</ModalButton>
          )}
          <div className="flex-1" />
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton primary onClick={submit} disabled={!name.trim() || !title.trim()}>{existing ? "Save changes" : "Add stakeholder"}</ModalButton>
        </>
      }>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Name">
          <TextInput value={name} onChange={setName} placeholder="Maya Chen" />
        </FormField>
        <FormField label="Title">
          <TextInput value={title} onChange={setTitle} placeholder="VP Engineering" />
        </FormField>
        <FormField label="Role">
          <SelectInput<Stakeholder["role"]> value={role} onChange={setRole}
            options={ROLES.map((r) => ({ value: r, label: r }))} />
        </FormField>
        <FormField label="Sentiment">
          <SelectInput<Stakeholder["sentiment"]> value={sentiment} onChange={setSentiment}
            options={SENTIMENTS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
        </FormField>
        <FormField label="Department">
          <SelectInput<typeof DEPARTMENTS[number]> value={department} onChange={setDepartment}
            options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
        </FormField>
        <FormField label="Reports to">
          <SelectInput value={reportsTo} onChange={setReportsTo} options={managerOptions} />
        </FormField>
      </div>
    </Modal>
  );
}
