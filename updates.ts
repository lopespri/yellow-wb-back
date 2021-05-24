import { Model } from 'mongoose';

export class Controller {

    private service: Service;
    private modelMedicines: Model;
    private diseaseModel: Model;
    private modelPrescricao: Model;
    private modelCids: Model;

    constructor() {
        this.service = new Service();
        this.modelMedicines = new Model('medicine');
        this.diseaseModel = new Model('disease');
        this.modelPrescricao = new Model('prescricao');
        this.modelCids = new Model('cids');
    }

    async getUpdates(contentTypes?: string[], lastUpdate?: Date) {
        let arr = [];

        if (contentTypes && contentTypes.includes('medicine')) {
            let medicines = await this.modelMedicines.get({ date: { $gt: lastUpdate }});
            let sorted = reverseSort(medicines);
            let final = [sorted[0], sorted[1], sorted[2]];
            arr = arr.concat(final);
        }

        if (contentTypes && contentTypes.includes('diseases')) {
            let diseases = await this.diseaseModel.get({ date: { $gt: lastUpdate }});
            let sorted = reverseSort(diseases);
            let final = [sorted[0], sorted[1], sorted[2]];
            arr = arr.concat(final);
        }

        if (contentTypes && contentTypes.includes('prescricao')) {
            let prescription = await this.modelPrescricao.get({ date: { $gt: lastUpdate }});
            let sorted = reverseSort(prescription);
            let final = [sorted[0], sorted[1], sorted[2]];
            arr = arr.concat(final);
        }

        if (contentTypes && contentTypes.includes('cids')) {
            let cids = await this.modelCids.get({ date: { $gt: lastUpdate }});
            let sorted = reverseSort(cids);
            let final = [sorted[0], sorted[1], sorted[2]];
            arr = arr.concat(final);
        }

        if (arr.length >= 2) {
            arr.forEach(function (item) {
                item.updatedAt = this.service.formatDates(item.updatedAt);
            })
        } else {
            arr = [];
        }


        return arr;
    }
}

function reverseSort(arr) {
    var sortedArray = arr.sort((obj1, obj2) => {
        if (obj1.updatedAt > obj2.updatedAt) {
            return -1;
        }

        if (obj1.updatedAt < obj2.updatedAt) {
            return 1;
        }

        return 0;
    });

    return sortedArray;
}

export class Service {
    constructor();

    formatDates(item): string {
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
        var one_day = 1000 * 60 * 60 * 24;
        const days = Math.round(difference / one_day);
        return days + ' dias atrás';
    }

    getDataFormatadaEmSemanas(difference: number): string {
        var one_week = 1000 * 60 * 60 * 24 * 7;
        const weeks = Math.round(difference / one_week);
        return weeks + ' semanas atrás';
    }
}
