// base - Product.find()
// base - Product.find(email: {'ariffidan03@gmail.com'})

//bigQ - //seacrh=off-wite&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5

class WhereClause{
   constructor(base, bigQ){
      this.base = base;
      this.bigQ = bigQ;
   }

   search(){
      const searchword = this.bigQ.search ? {
         name: {
            $regex: this.bigQ.search,
            $options: 'i'
         }
      } : {}

      this.base = this.base.find({...searchword});
      return this;
   }

   // to handle category
   filter(){
      const copyQ = {...this.bigQ};

      delete copyQ['search'];
      delete copyQ['page'];
      delete copyQ['limit'];

      // convert copyQ into string => copyQ
      let stringOfCopyQ = JSON.stringify(copyQ);

      stringOfCopyQ = stringOfCopyQ.replace(
         /\b(gte|lte|gt|lt)\b/g,
         (match) => `$${match}`
      );
      // again turn to json
      let jsonOfCopyQ = JSON.parse(stringOfCopyQ);

      this.base = this.base.find(jsonOfCopyQ);
      return this;
   }

   pager(resultperPage){
      let currentPage = 1;
      // update
      if(this.bigQ.page){
         currentPage = this.bigQ.page;
      }

      const skipValue = resultperPage * (currentPage -1);

      this.base = this.base.limit(resultperPage).skip(skipValue)
      return this;
   }
};

module.exports = WhereClause;
