/**
 * Escalation Dialog Component
 *
 * Diálogo de confirmação para abrir chamado/human escalation
 * Mostra resumo do problema e pergunta confirmação
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/Dialog';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { Label } from '@/components/Label';
import { AlertCircle, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EscalationDialogProps {
  isOpen: boolean;
  onConfirm: (dados: {
    filial: string;
    sistema: string;
    mensagemErro: string;
    desdeQuando: string;
  }) => void;
  onCancel: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function EscalationDialog({
  isOpen,
  onConfirm,
  onCancel,
  onOpenChange
}: EscalationDialogProps) {
  const [filial, setFilial] = useState('');
  const [sistema, setSistema] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [desdeQuando, setDesdeQuando] = useState('');

  const handleConfirm = () => {
    onConfirm({ filial, sistema, mensagemErro, desdeQuando });
    setFilial('');
    setSistema('');
    setMensagemErro('');
    setDesdeQuando('');
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    setFilial('');
    setSistema('');
    setMensagemErro('');
    setDesdeQuando('');
    onOpenChange?.(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange || (() => {})}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Falar com atendente
          </DialogTitle>
          <DialogDescription>
            Antes de abrir o chamado, preciso coletar algumas informações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">O que será criado:</p>
                <p className="text-sm text-amber-700">
                  Um chamado no sistema de suporte com o resumo da conversa.
                  Um atendente entrará em contato em até 30 minutos.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="filial">Filial</Label>
              <TextInput
                id="filial"
                value={filial}
                onChange={(e) => setFilial(e.target.value)}
                placeholder="Ex: Loja 12 - Centro"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sistema">Sistema</Label>
              <TextInput
                id="sistema"
                value={sistema}
                onChange={(e) => setSistema(e.target.value)}
                placeholder="Ex: Sistema de Notas Fiscais"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="mensagemErro">Mensagem de erro</Label>
              <TextInput
                id="mensagemErro"
                value={mensagemErro}
                onChange={(e) => setMensagemErro(e.target.value)}
                placeholder="Cole ou digite a mensagem de erro completa"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="desdeQuando">Desde quando</Label>
              <TextInput
                id="desdeQuando"
                value={desdeQuando}
                onChange={(e) => setDesdeQuando(e.target.value)}
                placeholder="Ex: Desde esta manhã, há 2 horas"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!filial || !sistema || !mensagemErro}
          >
            <FileText className="w-4 h-4 mr-2" />
            Abrir chamado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}