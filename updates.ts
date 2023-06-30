import { Model } from 'mongoose';

export class ListUpdatesController {

    constructor(  private readonly service: UpdatesService) {}

    async getUpdates(contentTypes?: string[], lastUpdate?: Date) {
        return this.service.getUpdates(contentTypes, lastUpdate)
    }
}


export class UpdatesService {
    constructor(    
        private readonly medicinesModel: Model,
        private readonly diseaseModel: Model,
        private readonly prescricaoModel: Model,
        private readonly cidsModel: Model){
    };

    formatDates(item:Model): string {
        const updatedAt = item.updatedAt as Date;
        const today = new Date();
        const lastWeek = today - this.getDaysAgo(7);
        const lastMonth = today - this.getDaysAgo(30);
        const difference = today - updatedAt;

        if (difference < lastWeek) {
            this.getDataFormatadaEmDias(difference);
        } else if (difference < lastMonth) {
            this.getDataFormatadaEmSemanas(difference);
        }

        return 'Em ' + updatedAt.toLocaleDateString('pt-BR');
    }

    getDaysAgo(days: number): number {
        const today = new Date();
        return (new Date()).setDate(today.getDate() - days);
    }

    getDataFormatadaEmDias(difference: number): string {
        const oneDay = 1000 * 60 * 60 * 24;
        const days = Math.round(difference / oneDay);
        return days + ' dias atrás';
    }

    getDataFormatadaEmSemanas(difference: number): string {
      const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const weeks = Math.round(difference / oneWeek);
        return weeks + ' semanas atrás';
    }

    async getUpdates(contentTypes?: string[], lastUpdate?: Date): Promise<Model[]> {
        let arrPromises = [];

        if (contentTypes){       
            if (contentTypes.includes('medicine')) {
                const medicinesPromise = this.medicinesModel.get({ date: { $gt: lastUpdate }}).sort({ date:-1}).limit(3);
                arrPromises = arrPromises.concat(medicinesPromise);
            }
    
            if (contentTypes.includes('diseases')) {
                const diseasesPromise = this.diseaseModel.get({ date: { $gt: lastUpdate }}).sort({ date:-1}).limit(3);;            
                arrPromises = arrPromises.concat(diseasesPromise);
            }
    
            if (contentTypes.includes('prescricao')) {
                const prescriptionPromise = this.prescricaoModel.get({ date: { $gt: lastUpdate }}).sort({ date:-1}).limit(3);;            
                arrPromises = arrPromises.concat(prescriptionPromise);
            }
    
            if (contentTypes.includes('cids')) {
                const cidsPromise = this.cidsModel.get({ date: { $gt: lastUpdate }}).sort({ date:-1}).limit(3);;            
                arrPromises = arrPromises.concat(cidsPromise);
            }
         }
        const arr = await Promise.all(arrPromises)

        if (arr.length < 2) {
            return []      
        } 


        return arr.map((item:Model) => {
             item.updatedAt = this.formatDates(item.updatedAt);
        });
    }
}
