import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: number;
  full_name: string;
  age: number;
  has_bank_card: boolean;
  telegram_username: string;
  job_position: string;
  created_at: string;
}

const JOBS = [
  { id: 'text_resale', title: 'Перепродажа текста', description: 'Работа с текстовым контентом и его распространением' },
  { id: 'translator', title: 'Переводчик текста', description: 'Перевод документов и материалов на разные языки' },
  { id: 'social_boost', title: 'Накрутка соцсетей', description: 'SMM и продвижение в социальных сетях' }
];

export default function Index() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    has_bank_card: false,
    telegram_username: '',
    job_position: 'text_resale'
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://functions.poehali.dev/33196fb4-2c5f-4a2b-b50a-d8846cc01fca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age)
        })
      });

      if (response.ok) {
        toast({
          title: 'Анкета отправлена',
          description: 'Ваша заявка успешно принята. Мы свяжемся с вами в ближайшее время.'
        });
        setFormData({
          full_name: '',
          age: '',
          has_bank_card: false,
          telegram_username: '',
          job_position: 'text_resale'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить анкету. Попробуйте позже.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/33196fb4-2c5f-4a2b-b50a-d8846cc01fca', {
        method: 'GET',
        headers: { 'X-Admin-Password': adminPassword }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        toast({
          title: 'Ошибка доступа',
          description: 'Неверный пароль администратора',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    }
  };

  const getJobTitle = (id: string) => JOBS.find(j => j.id === id)?.title || id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="Briefcase" size={32} className="text-accent" />
            <h1 className="text-2xl font-bold text-primary">HR Портал</h1>
          </div>
          <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Icon name="Shield" size={18} />
                Администратор
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Панель администратора</DialogTitle>
                <DialogDescription>Просмотр всех поданных анкет</DialogDescription>
              </DialogHeader>
              
              {applications.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Введите пароль"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <Button onClick={handleAdminLogin}>
                      Войти
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Всего анкет: {applications.length}</p>
                    <Button variant="outline" size="sm" onClick={() => setApplications([])}>
                      <Icon name="LogOut" size={16} />
                    </Button>
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Имя</TableHead>
                          <TableHead>Возраст</TableHead>
                          <TableHead>Банк. карта</TableHead>
                          <TableHead>Telegram</TableHead>
                          <TableHead>Вакансия</TableHead>
                          <TableHead>Дата</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.full_name}</TableCell>
                            <TableCell>{app.age}</TableCell>
                            <TableCell>
                              {app.has_bank_card ? (
                                <Badge variant="default" className="gap-1">
                                  <Icon name="Check" size={14} />
                                  Да
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <Icon name="X" size={14} />
                                  Нет
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{app.telegram_username}</TableCell>
                            <TableCell>{getJobTitle(app.job_position)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(app.created_at).toLocaleDateString('ru-RU')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-primary">Подать анкету на работу</h2>
            <p className="text-lg text-muted-foreground">
              Заполните форму для участия в отборе на вакансию
            </p>
          </div>

          <div className="grid gap-6">
            {JOBS.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Target" size={20} className="text-accent" />
                    {job.title}
                  </CardTitle>
                  <CardDescription>{job.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={24} />
                Анкета соискателя
              </CardTitle>
              <CardDescription>Все поля обязательны для заполнения</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Полное имя</Label>
                  <Input
                    id="full_name"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Иван Иванов"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Возраст</Label>
                  <Input
                    id="age"
                    type="number"
                    required
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="25"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="has_bank_card">Наличие банковской карты</Label>
                    <p className="text-sm text-muted-foreground">
                      Требуется для получения оплаты
                    </p>
                  </div>
                  <Switch
                    id="has_bank_card"
                    checked={formData.has_bank_card}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_bank_card: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram_username">Telegram username</Label>
                  <Input
                    id="telegram_username"
                    required
                    value={formData.telegram_username}
                    onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Выберите вакансию</Label>
                  <RadioGroup
                    value={formData.job_position}
                    onValueChange={(value) => setFormData({ ...formData, job_position: value })}
                  >
                    {JOBS.map((job) => (
                      <div key={job.id} className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                        <RadioGroupItem value={job.id} id={job.id} />
                        <Label htmlFor={job.id} className="flex-1 cursor-pointer">
                          <span className="font-medium">{job.title}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={20} className="mr-2" />
                      Отправить анкету
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 HR Портал. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
