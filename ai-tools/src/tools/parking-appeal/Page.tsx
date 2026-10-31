import { TOOLS } from '../../../shared/tools';
import { ToolLanding } from '../../components/ToolLanding';
import { PARKING_FAQS } from './content';
import { ParkingAppealForm } from './Form';
import { ParkingAppealResult, type ParkingAppealDisplay } from './Result';
import sample from '../../samples/parking-appeal.json';

export function ParkingAppealPage() {
  return (
    <ToolLanding
      tool={TOOLS['parking-appeal']}
      h1="Parking ticket appeal letter writer"
      form={<ParkingAppealForm />}
      sampleIntro="A sample using made-up details. Yours is written from your facts only, as PDF + Word."
      sample={<ParkingAppealResult r={sample as ParkingAppealDisplay} sample />}
      faqs={PARKING_FAQS}
    />
  );
}
