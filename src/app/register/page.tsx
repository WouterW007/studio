import { GroupForm } from '@/components/groups/GroupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterGroupPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Registreer 'n Nuwe Gaan Groep</CardTitle>
          <CardDescription className="text-lg">
            Voltooi asseblief die onderstaande vorm om jou groep by die {`kerk.co.za`} Gaan Groepe-gids te voeg.
            Alle groepe word eers goedgekeur voordat dit publiek sigbaar word.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroupForm />
        </CardContent>
      </Card>
    </div>
  );
}
