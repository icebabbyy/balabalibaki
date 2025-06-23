
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Bold, Italic, Image, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const RichTextEditor = ({ value, onChange, onSave, onCancel, isEditing }: RichTextEditorProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertImage = () => {
    if (!imageUrl.trim()) {
      toast.error('กรุณาใส่ URL รูปภาพ');
      return;
    }
    
    const imageMarkdown = `![รูปภาพ](${imageUrl})`;
    insertText(imageMarkdown);
    setImageUrl('');
    setShowImageInput(false);
    toast.success('เพิ่มรูปภาพสำเร็จ');
  };

  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');

  if (!isEditing) {
    return (
      <div className="prose max-w-none">
        {value ? (
          <div dangerouslySetInnerHTML={{ 
            __html: value
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />')
              .replace(/\n/g, '<br />')
          }} />
        ) : (
          <p className="text-gray-500 italic">ไม่มีคำอธิบายสินค้า</p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">แก้ไขคำอธิบายสินค้า</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formatting Tools */}
        <div className="flex items-center space-x-2 border-b pb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={formatBold}
            title="ตัวหนา"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={formatItalic}
            title="ตัวเอียง"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowImageInput(!showImageInput)}
            title="เพิ่มรูปภาพ"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>

        {/* Image URL Input */}
        {showImageInput && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <Label htmlFor="imageUrl">URL รูปภาพ</Label>
            <div className="flex space-x-2">
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && insertImage()}
              />
              <Button type="button" size="sm" onClick={insertImage}>
                เพิ่ม
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowImageInput(false);
                  setImageUrl('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Text Editor */}
        <div className="space-y-2">
          <Label htmlFor="description">เนื้อหาคำอธิบาย</Label>
          <Textarea
            ref={textareaRef}
            id="description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="พิมพ์คำอธิบายสินค้า... 
            
ใช้ **ข้อความ** สำหรับตัวหนา
ใช้ *ข้อความ* สำหรับตัวเอียง
หรือใช้ปุ่มเครื่องมือด้านบน"
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        {/* Preview */}
        {value && (
          <div className="space-y-2">
            <Label>ตัวอย่าง</Label>
            <div className="border rounded-lg p-3 bg-white prose max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: value
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />')
                  .replace(/\n/g, '<br />')
              }} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button onClick={onSave} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            บันทึก
          </Button>
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RichTextEditor;
