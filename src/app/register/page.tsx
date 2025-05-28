
import { GroupForm } from '@/components/groups/GroupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterGroupPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Registreer 'n Nuwe Kleingroep</CardTitle>
          <CardDescription className="text-lg">
            registreer jou kleingroep hier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroupForm />
        </CardContent>
      </Card>
    </div>
  );
}

    